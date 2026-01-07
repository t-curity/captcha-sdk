import { THEME } from "@/ui/theme";
import type { RawPointerEvent } from "@/ui/input/raw";
import { StrokeManager } from "@/utils/StrokeManager";
import { getEventCoords } from "@/utils/coords";
import { PhaseBGhostManager } from "./phaseBGhostManager";
import { PhaseBSlotManager } from "./phaseBSlotManager";
import { sleep } from "@/utils/sleep";
import { DRAG_THRESHOLD } from "./phaseB.constants";
import { createDragUI } from "./phaseBDragUI";

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
  const dragUI = createDragUI({
    phaseRoot,
    gridEl,
    slotEls,
    ghost,
  });

  let activePointerId: number | null = null;
  let dragSessionId: number = 0;

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
      const img = getCellImg(activeImageIndex);

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
    console.log("handleEnd called", e, isCancelled);
    if (e.pointerId !== activePointerId) return;

    const mySession = dragSessionId;

    try {
      endPointerTracking(e, isCancelled);
      dragUI.clearImmediate();

      if (isCancelled || activeImageIndex === null) return;

      if (ghost.hasGhost()) {
        const targetSlot = findSlotByPoint(e.clientX, e.clientY);

        if (targetSlot) {
          // to slot
          const targetSlotIndex = Number(targetSlot.dataset.slot);

          if (sourceSlotIndex !== null && sourceSlotIndex !== targetSlotIndex) {
            // from slot: 슬롯 간 교체
            await swapSlots(sourceSlotIndex, targetSlotIndex);
          } else {
            // from grid: 이미지 등록
            await dropIntoSlot(targetSlotIndex, activeImageIndex);
          }
        } else if (
          isOverGrid(e.clientX, e.clientY) &&
          sourceSlotIndex !== null
        ) {
          // to grid from slot: 이미지 제거
          await dropOutOfSlot(sourceSlotIndex);
        } else {
          const fallbackTarget =
            sourceSlotIndex !== null
              ? slotEls[sourceSlotIndex]
              : getCell(activeImageIndex);
          // to nowhere from anywhere: 이미지 복귀

          if (fallbackTarget) {
            await snapBack(
              activeImageIndex,
              fallbackTarget,
              sourceSlotIndex !== null,
            );
          }
        }
      } else if (sourceSlotIndex !== null) {
        // from slot: 이미지 제거 (클릭)
        await dropOutOfSlot(sourceSlotIndex);
      }
    } finally {
      if (mySession !== dragSessionId) return;
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

    await dropOutOfSlot(slotIdx);
  }

  async function performShake(cell: HTMLElement) {
    cell.classList.remove("shake");
    void cell.offsetWidth; // 브라우저 리플로우 강제
    cell.classList.add("shake");
    await sleep(THEME.duration.shake);
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

  function findSlotByPoint(x: number, y: number): HTMLDivElement | null {
    for (const slot of slotEls) {
      const rect = slot.getBoundingClientRect();

      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        return slot as HTMLDivElement;
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

  function renderSlots() {
    console.log("renderSlots");
    slotEls.forEach((slot, i) => {
      const imgIdx = slots.get(i);

      if (imgIdx == null) {
        slot.querySelector("img")?.removeAttribute("src");
        slot.classList.remove("has-image");
        return;
      }

      const img = getCellImg(imgIdx);

      if (img) {
        slot.querySelector("img")?.setAttribute("src", img.src);
        slot.classList.add("has-image");
        return;
      }
    });
  }

  function renderGridUsage() {
    // 사용 중 상태 동기화 (슬롯에 있으면 사용 중)
    getCells().forEach((cell) => {
      const imgIdx = Number(cell.dataset.index);

      cell.classList.toggle("is-used", slots.includes(imgIdx));
    });
  }

  async function dropIntoSlot(slotIndex: number, imageIndex: number) {
    console.log("dropIntoSlot", slotIndex, imageIndex);
    const prevImageIndex = slots.get(slotIndex);

    // 이미 같은 이미지가 들어가 있다면 무시
    if (prevImageIndex === imageIndex) return;

    // 새로운 이미지를 슬롯에 안착
    slots.set(slotIndex, imageIndex);

    renderSlots();

    // [밀어내기 로직] 슬롯에 이미 이미지가 있는 경우
    if (prevImageIndex !== null) {
      const prevCell = getCell(prevImageIndex);
      const prevImg = getCellImg(prevImageIndex);

      const nowCell = getCell(imageIndex);

      if (nowCell) {
        nowCell.classList.add("is-used");
      }

      if (prevCell && prevImg) {
        // 슬롯에 있던 이미지를 그리드의 원래 칸으로 날려보냄
        await ghost.triggerFlight(
          slotEls[slotIndex].getBoundingClientRect(),
          prevCell.getBoundingClientRect(),
          prevImg,
          true,
        );
      }
    }

    renderSlots();
    renderGridUsage();
    verifyCompletion();
  }

  async function dropOutOfSlot(slotIndex: number) {
    console.log("dropOutOfSlot", slotIndex);
    const imageIndex = slots.get(slotIndex);
    if (imageIndex === null) return;

    const cell = getCell(imageIndex);
    const img = getCellImg(imageIndex);

    if (!cell || !img) return;

    slots.clear(slotIndex);
    renderSlots();

    await ghost.triggerFlight(
      slotEls[slotIndex].getBoundingClientRect(),
      cell.getBoundingClientRect(),
      img,
      true,
    );

    renderSlots();
    renderGridUsage();
  }

  async function swapSlots(srcIdx: number, destIdx: number) {
    console.log("swapSlots", srcIdx, destIdx);
    const imgInSrcIndex = slots.get(srcIdx);
    const imgInDestIndex = slots.get(destIdx);

    if (imgInSrcIndex === null) return;

    slots.set(destIdx, imgInSrcIndex);
    slots.clear(srcIdx);
    renderSlots();

    if (imgInDestIndex === null) return;

    const img = getCellImg(imgInDestIndex);

    if (img) {
      slots.set(srcIdx, imgInDestIndex);

      await ghost.triggerFlight(
        slotEls[destIdx].getBoundingClientRect(),
        slotEls[srcIdx].getBoundingClientRect(),
        img,
        false,
      );

      renderSlots();
    }
  }

  async function snapBack(
    imageIndex: number,
    flightTo: HTMLElement,
    isToGrid: boolean,
  ) {
    console.log("snapBack", imageIndex, flightTo, isToGrid);
    const ghostRect = ghost.getRect();
    const img = getCellImg(imageIndex);

    if (!ghostRect || flightTo === null || !img) return;

    dragUI.removeGhost();

    await ghost.triggerFlight(
      ghostRect,
      flightTo.getBoundingClientRect(),
      img,
      isToGrid,
    );

    renderSlots();
    renderGridUsage();
  }

  function beginPointerTracking(e: PointerEvent) {
    const { viewport_p, img_p } = getEventCoords(
      e,
      gridEl.getBoundingClientRect(),
    );

    manager.start(viewport_p, img_p);
    phaseRoot.setPointerCapture(e.pointerId);
    activePointerId = e.pointerId;
    dragSessionId++;

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

  function getCells(): NodeListOf<HTMLElement> {
    return gridEl.querySelectorAll(".tc-cell");
  }

  function getCell(imageIndex: number): HTMLElement | null {
    return gridEl.querySelector(`.tc-cell[data-index="${imageIndex}"]`);
  }

  function getCellImg(imageIndex: number): HTMLImageElement | null {
    return gridEl.querySelector(`.tc-cell[data-index="${imageIndex}"] img`);
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
    dragUI.removeGhost();
    manager.clear();
  };
}
