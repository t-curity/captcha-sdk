import { THEME } from "@/ui/theme";
import type { RawPointerEvent } from "@/ui/input/raw";
import { StrokeManager } from "@/utils/StrokeManager";
import { getEventCoords } from "@/utils/coords";
import { PhaseBGhostManager } from "./phaseBGhostManager";
import { PhaseBSlotManager } from "./phaseBSlotManager";
import { sleep } from "@/utils/sleep";

type PhaseBInputParams = {
  gridEl: HTMLDivElement;
  slotEls: HTMLElement[];
  max_answer: number;
  duration: number;
  onPass: (data: { selected: number[]; raw_points: RawPointerEvent[] }) => void;
};

export function usePhaseBInput({
  gridEl,
  slotEls,
  max_answer,
  onPass,
  duration = 300,
}: PhaseBInputParams) {
  const phaseRoot = gridEl.closest(".tc-phase-root") as HTMLElement;
  const manager = new StrokeManager();
  const ghost = new PhaseBGhostManager(phaseRoot, gridEl);
  const slots = new PhaseBSlotManager(slotEls.length);

  let activePointerId: number | null = null;
  let activeImageIndex: number | null = null;
  let sourceSlotIndex: number | null = null;
  let isDragTriggered = false;
  let draggingCell: HTMLElement | null = null;

  if (!phaseRoot) {
    throw new Error("Phase root not found");
  }

  function onPointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;
    const cell = target.closest(".tc-cell") as HTMLElement;
    const slotEl = target.closest(".tc-phase-b-slot") as HTMLElement;

    if (activePointerId !== null) return;

    if (cell) {
      // 그리드에서 잡기
      const index = Number(cell.dataset.index);
      if (slots.findSlotByImage(index) !== -1) return;
      activeImageIndex = index;
      draggingCell = cell;
      draggingCell.classList.add("is-dragging");
      sourceSlotIndex = null;
    } else if (slotEl) {
      // 슬롯에서 잡기
      const sIdx = Number(slotEl.dataset.slot);
      const slot = slots.get(sIdx);

      if (slot === null) return;
      activeImageIndex = slot;
      sourceSlotIndex = sIdx;
      draggingCell = gridEl.querySelector(
        `.tc-cell[data-index="${activeImageIndex}"]`,
      ) as HTMLElement;
      slotEls[sourceSlotIndex].classList.add("is-dragging");
    } else {
      return;
    }

    e.preventDefault();

    activePointerId = e.pointerId;
    isDragTriggered = false;

    const { viewport_p, img_p } = getEventCoords(
      e,
      gridEl.getBoundingClientRect(),
    );
    manager.start(viewport_p, img_p);
    phaseRoot.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (e.pointerId !== activePointerId || !manager.isPressed) return;
    e.preventDefault();

    const firstPoint = manager.getCurrentSegment()[0];
    if (!firstPoint) return;

    const dist = Math.sqrt(
      Math.pow(e.clientX - firstPoint.viewport_p.x, 2) +
        Math.pow(e.clientY - firstPoint.viewport_p.y, 2),
    );

    // 5px 이상 이동 시 드래그 모드로 전환
    if (!isDragTriggered && dist > 5) {
      isDragTriggered = true;
      if (draggingCell) ghost.create(draggingCell);
      if (sourceSlotIndex !== null) {
        slotEls[sourceSlotIndex].classList.add("is-dragging");
      }
    }

    if (isDragTriggered) {
      const { viewport_p, img_p } = getEventCoords(
        e,
        gridEl.getBoundingClientRect(),
      );
      manager.move(viewport_p, img_p);

      ghost.move(e);

      const slot = findSlotByPoint(e.clientX, e.clientY);

      slotEls.forEach((s) => s.classList.toggle("is-hover", s === slot));

      if (slot) {
        ghost.addClass("is-snapped");
        ghost.moveTo(slot.getBoundingClientRect());
      } else {
        ghost.removeClass("is-snapped");
      }

      gridEl.classList.toggle(
        "is-drag-over",
        isOverGrid(e.clientX, e.clientY) && sourceSlotIndex !== null,
      );
    }
  }

  function handleEnd(e: PointerEvent, isCancelled: boolean) {
    if (e.pointerId !== activePointerId || !manager.isPressed) return;
    if (isCancelled || activeImageIndex === null) return;

    if (!isDragTriggered && sourceSlotIndex !== null) {
      removeFromSlot(sourceSlotIndex);
    } else if (isDragTriggered) {
      // 드래그 중
      const targetSlot = findSlotByPoint(e.clientX, e.clientY);
      const ghostRect = ghost.getRect();

      if (targetSlot) {
        // to slot
        const targetSlotIndex = Number(targetSlot.dataset.slot);

        if (sourceSlotIndex !== null && sourceSlotIndex !== targetSlotIndex) {
          // from slot
          swapSlots(sourceSlotIndex, targetSlotIndex);
        } else {
          // from grid
          if (sourceSlotIndex !== null) slots.clear(sourceSlotIndex);
          applyDropToSlot(targetSlot, activeImageIndex);
        }
      } else if (sourceSlotIndex !== null && ghostRect) {
        // from slot
        if (isOverGrid(e.clientX, e.clientY) && draggingCell) {
          // to grid
          slots.clear(sourceSlotIndex);
          renderSlots(); // 슬롯 먼저 비움
          ghost
            .triggerFlight(
              ghostRect,
              draggingCell.getBoundingClientRect(),
              activeImageIndex,
              true,
            )
            .then(() => {
              syncGridState();
            });
        } else {
          // to nowhere
          if (sourceSlotIndex !== null && ghostRect) {
            const sourceSlot = slotEls[sourceSlotIndex];

            ghost
              .triggerFlight(
                ghostRect,
                sourceSlot.getBoundingClientRect(),
                activeImageIndex,
                false,
              )
              .then(() => {
                syncGridState();
              });
          }
        }
      } else if (draggingCell && ghostRect) {
        // from grid to nowhere
        // performShake(draggingCell).then(() => {
        //   draggingCell?.classList.remove("shake");
        // });

        const sourceSlot = draggingCell;

        ghost
          .triggerFlight(
            ghostRect,
            sourceSlot.getBoundingClientRect(),
            activeImageIndex,
            false,
          )
          .then(() => {
            syncGridState();
          });
      }
    }

    // 모든 슬롯이 채워졌는지 확인
    verifyCompletion();
    cleanupPointer();
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

  function applyDropToSlot(slotEl: HTMLDivElement, imageIndex: number) {
    const slotIndex = Number(slotEl.dataset.slot);
    const prevImageIndex = slots.get(slotIndex);

    // 1. 이미 같은 이미지가 들어가 있다면 무시
    if (prevImageIndex === imageIndex) return;

    // 2. [밀어내기 로직] 슬롯에 이미 이미지가 있는 경우
    if (prevImageIndex !== null) {
      const prevCell = gridEl.querySelector(
        `.tc-cell[data-index="${prevImageIndex}"]`,
      ) as HTMLElement;

      if (prevCell) {
        // 슬롯에 있던 이미지를 그리드의 원래 칸으로 날려보냄
        ghost
          .triggerFlight(
            slotEl.getBoundingClientRect(), // 시작: 현재 슬롯
            prevCell.getBoundingClientRect(), // 끝: 그리드 칸
            prevImageIndex,
            true,
          )
          .then(() => {
            syncGridState();
          });
      }
    }

    // 3. 새로운 이미지를 슬롯에 안착
    slots.set(slotIndex, imageIndex);

    const newCell = gridEl.querySelector(
      `.tc-cell[data-index="${imageIndex}"]`,
    );
    newCell?.classList.add("is-used");

    renderSlots();
  }

  const slotRects: [HTMLElement, DOMRect][] = slotEls.map((slot) => [
    slot,
    slot.getBoundingClientRect(),
  ]);

  function findSlotByPoint(x: number, y: number): HTMLDivElement | null {
    for (const [slot, rect] of slotRects) {
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
    slotEls.forEach((slot, i) => {
      slot.innerHTML = "";
      const imgIdx = slots.get(i);
      if (imgIdx == null) {
        slot.classList.remove("has-image");
        return;
      }
      slot.classList.add("has-image");
      const img = gridEl.querySelector(`.tc-cell[data-index="${imgIdx}"] img`);
      if (img) {
        slot.appendChild(img.cloneNode(true));

        const removeBadge = document.createElement("div");
        removeBadge.className = "tc-remove-badge";
        removeBadge.innerHTML = "✕";

        removeBadge.onclick = (e) => {
          e.stopPropagation();
          removeFromSlot(i);
        };

        slot.appendChild(removeBadge);
      }
    });
  }

  async function swapSlots(srcIdx: number, destIdx: number) {
    const imgInSrc = slots.get(srcIdx); // 드래그 중인 이미지 (activeImageIndex와 동일)
    const imgInDest = slots.get(destIdx); // 타겟 슬롯에 원래 있던 이미지
    if (!imgInSrc) return;

    if (imgInDest === null) {
      // 타겟이 비어있으면 그냥 이동
      slots.set(destIdx, imgInSrc);
      slots.clear(srcIdx);
    } else {
      // [교체 핵심] 타겟 이미지를 시작 슬롯으로 날려보냄
      const srcSlotEl = slotEls[srcIdx];
      const destSlotEl = slotEls[destIdx];

      slots.set(destIdx, imgInSrc);
      slots.clear(srcIdx);
      renderSlots();
      slots.set(srcIdx, imgInDest);

      // 타겟 슬롯의 이미지가 원래 내 자리(src)로 날아가는 비행 연출
      await ghost.triggerFlight(
        destSlotEl.getBoundingClientRect(),
        srcSlotEl.getBoundingClientRect(),
        imgInDest,
        false,
      );
    }
    renderSlots();
  }

  function removeFromSlot(slotIndex: number) {
    const imageIndex = slots.get(slotIndex);
    if (imageIndex === null) return;
    const cellEl = gridEl.querySelector(
      `.tc-cell[data-index="${imageIndex}"]`,
    ) as HTMLElement;

    ghost
      .triggerFlight(
        slotEls[slotIndex].getBoundingClientRect(),
        cellEl.getBoundingClientRect(),
        imageIndex,
        true,
      )
      .then(() => {
        syncGridState();
      });
    slots.set(slotIndex, null);
    renderSlots();
  }

  function cleanupPointer() {
    if (activePointerId != null) {
      try {
        phaseRoot.releasePointerCapture(activePointerId);
      } catch {}
    }
    draggingCell?.classList.remove("is-dragging");
    draggingCell = null;

    ghost.remove();

    slotEls.forEach((s) => {
      s.classList.remove("is-hover");
      s.classList.remove("is-dragging");
    });

    activePointerId = null;
    activeImageIndex = null;

    gridEl.classList.toggle("is-drag-over", false);
  }

  function syncGridState() {
    const currentImagesInSlots = slots.getFilled();
    const allCells = gridEl.querySelectorAll(
      ".tc-cell",
    ) as NodeListOf<HTMLElement>;

    allCells.forEach((cell) => {
      const imgIdx = Number(cell.dataset.index);
      const isInSlot = currentImagesInSlots.includes(imgIdx);

      // 1. 사용 중 상태 동기화 (슬롯에 있으면 사용 중)
      cell.classList.toggle("is-used", isInSlot);

      // 2. 상호작용 관련 클래스 일괄 청소
      cell.classList.remove("is-dragging");
    });
  }

  const onPointerUp = (e: PointerEvent) => handleEnd(e, false);
  const onLostPointerCapture = (e: PointerEvent) => handleEnd(e, true);
  const onPointerCancel = (e: PointerEvent) => handleEnd(e, true);

  phaseRoot.addEventListener("pointerdown", onPointerDown);
  phaseRoot.addEventListener("pointermove", onPointerMove);
  phaseRoot.addEventListener("lostpointercapture", onLostPointerCapture);
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointercancel", onPointerCancel);

  return () => {
    cleanupPointer();
    phaseRoot.removeEventListener("pointerdown", onPointerDown);
    phaseRoot.removeEventListener("pointermove", onPointerMove);
    phaseRoot.removeEventListener("lostpointercapture", onLostPointerCapture);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerCancel);
  };
}
