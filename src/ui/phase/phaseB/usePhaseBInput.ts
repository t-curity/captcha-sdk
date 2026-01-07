import type { RawPointerEvent } from "@/ui/input/raw";
import { StrokeManager } from "@/utils/StrokeManager";
import { getEventCoords } from "@/utils/coords";
import { PhaseBGhostManager } from "./phaseBGhostManager";
import { PhaseBSlotManager } from "./phaseBSlotManager";
import { DRAG_THRESHOLD } from "./phaseB.constants";
import { PhaseBDragUIManager } from "./phaseBDragUIManager";
import { PhaseBCellManager } from "./phaseBCellManager";
import { createPhaseBAction } from "./phaseBActions";

type PhaseBInputParams = {
  gridEl: HTMLDivElement;
  slotEls: HTMLElement[];
  max_answer: number;
  duration?: number;
  onPass: (data: { selected: number[]; raw_points: RawPointerEvent[] }) => void;
};

export function usePhaseBInput({
  gridEl,
  slotEls,
  max_answer,
  onPass,
  duration = 300,
}: PhaseBInputParams) {
  const controller = new AbortController();
  const { signal } = controller;

  const phaseRoot = gridEl.closest(".tc-phase-root") as HTMLElement;
  const manager = new StrokeManager();
  const ghost = new PhaseBGhostManager(phaseRoot);
  const slots = new PhaseBSlotManager(slotEls.length);
  const cells = new PhaseBCellManager(gridEl);
  const dragUI = new PhaseBDragUIManager(phaseRoot, gridEl, slotEls, ghost);
  const action = createPhaseBAction(
    slotEls,
    slots,
    cells,
    ghost,
    verifyCompletion,
  );

  let activePointerId: number | null = null;
  let interactionId: number = 0;

  let activeImageIndex: number | null = null;
  let sourceSlotIndex: number | null = null;

  if (!phaseRoot) {
    throw new Error("Phase root not found");
  }

  function onPointerDown(e: PointerEvent) {
    if (activePointerId !== null) return;
    if (!(e.target instanceof HTMLElement)) return;

    const targetEl = e.target.closest(".tc-cell, .tc-phase-b-slot");

    if (!(targetEl instanceof HTMLElement)) return;

    e.preventDefault();

    if (targetEl.classList.contains("tc-cell")) {
      // 그리드에서 잡기
      const imgIndex = Number(targetEl.dataset.index);

      if (slots.findSlotByImage(imgIndex) !== -1) return;

      activeImageIndex = imgIndex;
      sourceSlotIndex = null;
    } else {
      // 슬롯에서 잡기
      const slotIdx = Number(targetEl.dataset.slot);
      const imgIndex = slots.get(slotIdx);

      if (imgIndex === null) return;

      activeImageIndex = imgIndex;
      sourceSlotIndex = slotIdx;
    }

    dragUI.removeGhost();
    dragUI.startPicking(targetEl);

    beginPointerTracking(e);
  }

  function onPointerMove(e: PointerEvent) {
    if (e.pointerId !== activePointerId || !manager.isPressed) return;

    e.preventDefault();

    updatePointerTracking(e);

    // 5px 이상 이동 시 드래그 모드로 전환
    if (!ghost.hasGhost()) {
      const firstPoint = manager.getFirstPoint();

      if (!firstPoint) return;

      const dist = Math.hypot(
        e.clientX - firstPoint.viewport_p.x,
        e.clientY - firstPoint.viewport_p.y,
      );

      if (dist <= DRAG_THRESHOLD || activeImageIndex === null) return;

      const rect = slotEls[0].getBoundingClientRect();
      const img = cells.getCellImg(activeImageIndex);

      if (!rect || !img) return;

      dragUI.attachGhost(rect, img);
    }

    dragUI.moveGhost(e);

    const slot = findSlotByPoint(e.clientX, e.clientY);

    dragUI.updateSnapping(slot);
    dragUI.snapGhostTo(slot?.getBoundingClientRect() ?? null);
    dragUI.updateDragOver(
      isOverGrid(e.clientX, e.clientY) && sourceSlotIndex !== null,
    );
  }

  async function handleEnd(e: PointerEvent, isCancelled: boolean) {
    if (e.pointerId !== activePointerId) return;

    const mySession = interactionId;

    try {
      endPointerTracking(e, isCancelled);
      dragUI.clearImmediate();

      if (isCancelled || activeImageIndex === null) return;

      if (ghost.hasGhost()) {
        const target = findDropTargetByPoint(e.clientX, e.clientY);

        if (target.type === "SLOT") {
          // to slot
          if (
            sourceSlotIndex !== null &&
            sourceSlotIndex !== target.slotIndex
          ) {
            // from slot: 슬롯 간 교체
            await action.swapSlots(sourceSlotIndex, target.slotIndex);
          } else {
            // from grid: 이미지 등록
            await action.dropIntoSlot(target.slotIndex, activeImageIndex);
          }
        } else if (target.type === "GRID" && sourceSlotIndex !== null) {
          // to grid from slot: 이미지 제거
          await action.dropOutOfSlot(sourceSlotIndex);
        } else {
          const fallbackTarget =
            sourceSlotIndex !== null
              ? slotEls[sourceSlotIndex]
              : cells.getCell(activeImageIndex);
          // to nowhere from anywhere: 이미지 복귀

          if (fallbackTarget) {
            await action.snapBack(
              activeImageIndex,
              fallbackTarget,
              sourceSlotIndex !== null,
            );
          }
        }
      } else if (sourceSlotIndex !== null) {
        // from slot: 이미지 제거 (클릭)
        await action.dropOutOfSlot(sourceSlotIndex);
      }
    } finally {
      if (mySession !== interactionId) return;
      dragUI.clearAfterAction();
    }
  }

  async function onClickRemoveBadge(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (!target.classList.contains("tc-remove-badge")) return;

    e.stopPropagation();
    e.preventDefault();

    const slotEl = target.closest(".tc-phase-b-slot") as HTMLElement;
    const slotIdx = Number(slotEl.dataset.slot);

    await action.dropOutOfSlot(slotIdx);
  }

  function findDropTargetByPoint(
    x: number,
    y: number,
  ):
    | { type: "SLOT"; slotIndex: number }
    | { type: "GRID" }
    | { type: "NOWHERE" } {
    const slot = findSlotByPoint(x, y);

    if (slot) {
      return { type: "SLOT", slotIndex: Number(slot.dataset.slot) };
    } else if (isOverGrid(x, y)) {
      return { type: "GRID" };
    }

    return { type: "NOWHERE" };
  }

  function findSlotByPoint(x: number, y: number): HTMLElement | null {
    for (const slot of slotEls) {
      const rect = slot.getBoundingClientRect();

      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        return slot;
      }
    }
    return null;
  }

  function isOverGrid(x: number, y: number): boolean {
    const rect = gridEl.getBoundingClientRect();

    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  function verifyCompletion() {
    const filledIndexes = slots.getFilled();

    if (filledIndexes.length === max_answer) {
      onPass({
        selected: filledIndexes,
        raw_points: manager.getFlattenedPoints(),
      });
    }
  }

  function beginPointerTracking(e: PointerEvent) {
    const { viewport_p, img_p } = getEventCoords(
      e,
      gridEl.getBoundingClientRect(),
    );

    manager.start(viewport_p, img_p);
    phaseRoot.setPointerCapture(e.pointerId);
    activePointerId = e.pointerId;
    interactionId++;

    dragUI.setGrabbing(true);

    console.assert(manager.isPressed === true);
  }

  function updatePointerTracking(e: PointerEvent) {
    const { viewport_p, img_p } = getEventCoords(
      e,
      gridEl.getBoundingClientRect(),
    );
    manager.move(viewport_p, img_p);

    console.assert(manager.isPressed === true);
  }

  function endPointerTracking(e: PointerEvent, isCancelled: boolean) {
    const { viewport_p, img_p } = getEventCoords(
      e,
      gridEl.getBoundingClientRect(),
    );

    manager.stop(viewport_p, img_p, isCancelled ? "cancel" : "up");

    if (activePointerId != null) {
      try {
        phaseRoot.releasePointerCapture(activePointerId);
      } catch {}
    }

    activePointerId = null;

    dragUI.setGrabbing(false);

    console.assert(manager.isPressed === false);
  }

  const onPointerUp = (e: PointerEvent) => handleEnd(e, false);
  const onLostPointerCapture = (e: PointerEvent) => handleEnd(e, true);
  const onPointerCancel = (e: PointerEvent) => handleEnd(e, true);

  phaseRoot.addEventListener("click", onClickRemoveBadge, {
    signal,
  });

  phaseRoot.addEventListener("pointerdown", onPointerDown, {
    signal,
    passive: false,
  });
  phaseRoot.addEventListener("pointermove", onPointerMove, {
    signal,
    passive: false,
  });
  document.addEventListener("pointerup", onPointerUp, {
    signal,
  });
  phaseRoot.addEventListener("lostpointercapture", onLostPointerCapture, {
    signal,
  });
  document.addEventListener("pointercancel", onPointerCancel, {
    signal,
  });

  return () => {
    controller.abort();
    dragUI.resetAll();
    manager.clear();
  };
}
