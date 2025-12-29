import { mapPointerType } from "@/ui/input/mapPointerType";
import { THEME } from "@/ui/theme";
import type { RawPointerEvent } from "@/ui/input/raw";
import { StrokeManager } from "@/utils/StrokeManager";
import { getEventCoords } from "@/utils/coords";

type PhaseBInputParams = {
  gridEl: HTMLDivElement;
  slotEls: HTMLElement[];
  max_answer: number;
  onPass: (data: { selected: number[]; raw_points: RawPointerEvent[] }) => void;
};

export function usePhaseBInput({
  gridEl,
  slotEls,
  max_answer,
  onPass,
}: PhaseBInputParams) {
  const manager = new StrokeManager();

  const slots: Array<number | null> = new Array(slotEls.length).fill(null);
  const phaseRoot = gridEl.closest(".tc-phase-root") as HTMLElement;

  let activePointerId: number | null = null;
  let activeImageIndex: number | null = null;
  let sourceSlotIndex: number | null = null;
  let isDragTriggered = false;
  let ghostEl: HTMLDivElement | null = null;
  let draggingCell: HTMLElement | null = null;

  if (!phaseRoot) {
    throw new Error("Phase root not found");
  }

  function onPointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;
    const cell = target.closest(".tc-cell") as HTMLElement;
    const slot = target.closest(".tc-phase-b-slot") as HTMLElement;

    if (activePointerId !== null) return;

    if (cell) {
      // 그리드에서 잡기
      const index = Number(cell.dataset.index);
      if (slots.includes(index)) return;
      activeImageIndex = index;
      draggingCell = cell;
      draggingCell.classList.add("is-dragging");
      sourceSlotIndex = null;
    } else if (slot) {
      // 슬롯에서 잡기
      const sIdx = Number(slot.dataset.slot);
      if (slots[sIdx] === null) return;
      activeImageIndex = slots[sIdx];
      sourceSlotIndex = sIdx;
      draggingCell = gridEl.querySelector(
        `.tc-cell[data-index="${activeImageIndex}"]`,
      ) as HTMLElement;
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
      if (draggingCell) createGhost(draggingCell);
      if (sourceSlotIndex !== null) {
        slotEls[sourceSlotIndex].classList.add("is-placeholder");
      }
    }

    if (isDragTriggered) {
      const { viewport_p, img_p } = getEventCoords(
        e,
        gridEl.getBoundingClientRect(),
      );
      manager.move(viewport_p, img_p);

      moveGhost(e);

      const slot = findSlotByPoint(e.clientX, e.clientY);
      slotEls.forEach((s) => s.classList.toggle("is-hover", s === slot));
    }
  }

  function handleEnd(e: PointerEvent, isCancelled: boolean) {
    if (e.pointerId !== activePointerId || !manager.isPressed) return;
    const targetSlot = findSlotByPoint(e.clientX, e.clientY);

    if (!isDragTriggered && !isCancelled) {
      // 클릭 판정: 드래그가 발생하지 않았고 슬롯에서 시작했다면 삭제
      if (sourceSlotIndex !== null) {
        removeFromSlot(sourceSlotIndex);
      }
    } else if (isDragTriggered) {
      // 드래그 판정
      if (!isCancelled && targetSlot && activeImageIndex !== null) {
        const targetSlotIndex = Number(targetSlot.dataset.slot);

        // [스왑 로직] 슬롯에서 시작해서 다른 슬롯에 놓았을 때
        if (sourceSlotIndex !== null && sourceSlotIndex !== targetSlotIndex) {
          swapSlots(sourceSlotIndex, targetSlotIndex);
        } else {
          // 일반적인 드롭 (그리드 -> 슬롯)
          if (sourceSlotIndex !== null) slots[sourceSlotIndex] = null;
          applyDropToSlot(targetSlot, activeImageIndex);
        }
      } else if (activeImageIndex !== null) {
        // 실패(허공): 시작점에 따라 다르게 처리
        if (sourceSlotIndex !== null) {
          // 슬롯에서 시작했다면 원래 슬롯으로 Snap-back
          const sourceSlot = slotEls[sourceSlotIndex];

          triggerFlight(
            ghostEl!.getBoundingClientRect(),
            sourceSlot.getBoundingClientRect(),
            activeImageIndex,
            false,
          ).then(() => {
            sourceSlot.classList.remove("is-placeholder");
          });
        } else if (draggingCell) {
          // 그리드에서 시작했다면 부르르
          draggingCell.classList.remove("shake");
          void draggingCell.offsetWidth;
          draggingCell.classList.add("shake");
          setTimeout(
            () => draggingCell?.classList.remove("shake"),
            THEME.duration.shake,
          );
        }
      }
    }

    const selectedIndexes = slots.filter((v): v is number => v !== null);

    // 모든 슬롯이 채워졌는지 확인
    if (selectedIndexes.length === max_answer) {
      onPass({
        selected: selectedIndexes,
        raw_points: manager.getFlattenedPoints(),
      });
    }
    cleanupPointer();
  }

  function createGhost(cell: HTMLElement) {
    ghostEl = document.createElement("div");
    ghostEl.className = "tc-drag-ghost";
    const img = cell.querySelector("img")!.cloneNode(true) as HTMLImageElement;
    ghostEl.appendChild(img);
    phaseRoot.appendChild(ghostEl);
  }

  function moveGhost(e: PointerEvent) {
    if (!ghostEl) return;
    const rootRect = phaseRoot.getBoundingClientRect();

    ghostEl.style.left = `${e.clientX - rootRect.left - 36}px`;
    ghostEl.style.top = `${e.clientY - rootRect.top - 36}px`;
  }

  function applyDropToSlot(slotEl: HTMLDivElement, imageIndex: number) {
    const slotIndex = Number(slotEl.dataset.slot);
    const prevImageIndex = slots[slotIndex];

    // 1. 이미 같은 이미지가 들어가 있다면 무시
    if (prevImageIndex === imageIndex) return;

    // 2. [밀어내기 로직] 슬롯에 이미 이미지가 있는 경우
    if (prevImageIndex !== null) {
      const prevCell = gridEl.querySelector(
        `.tc-cell[data-index="${prevImageIndex}"]`,
      ) as HTMLElement;

      if (prevCell) {
        // 슬롯에 있던 이미지를 그리드의 원래 칸으로 날려보냄
        triggerFlight(
          slotEl.getBoundingClientRect(), // 시작: 현재 슬롯
          prevCell.getBoundingClientRect(), // 끝: 그리드 칸
          prevImageIndex,
          true, // 그리드로 돌아가므로 투명도(opacity) 감소 적용
        );

        // 그리드 아이템의 '사용 중' 상태 해제 (애니메이션 종료 시점에 맞춰)
        setTimeout(() => {
          prevCell.classList.remove("is-used");
        }, 400);
      }
    }

    // 3. 새로운 이미지를 슬롯에 안착
    slots[slotIndex] = imageIndex;

    const newCell = gridEl.querySelector(
      `.tc-cell[data-index="${imageIndex}"]`,
    );
    newCell?.classList.add("is-used");

    renderSlots();
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

  function renderSlots() {
    slotEls.forEach((slot, i) => {
      slot.innerHTML = "";
      slot.classList.remove("is-placeholder");
      const imgIdx = slots[i];
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

  function swapSlots(srcIdx: number, destIdx: number) {
    const imgInSrc = slots[srcIdx]; // 드래그 중인 이미지 (activeImageIndex와 동일)
    const imgInDest = slots[destIdx]; // 타겟 슬롯에 원래 있던 이미지

    if (imgInDest === null) {
      // 타겟이 비어있으면 그냥 이동
      slots[destIdx] = imgInSrc;
      slots[srcIdx] = null;
    } else {
      // [교체 핵심] 타겟 이미지를 시작 슬롯으로 날려보냄
      const srcSlotEl = slotEls[srcIdx];
      const destSlotEl = slotEls[destIdx];

      // 타겟 슬롯의 이미지가 원래 내 자리(src)로 날아가는 비행 연출
      triggerFlight(
        destSlotEl.getBoundingClientRect(),
        srcSlotEl.getBoundingClientRect(),
        imgInDest,
        false,
      );

      // 데이터 스왑
      slots[destIdx] = imgInSrc;
      slots[srcIdx] = imgInDest;
    }

    renderSlots();
  }

  // 공통 비주얼 함수
  function triggerFlight(
    startRect: DOMRect,
    endRect: DOMRect,
    imageIndex: number,
    isToGrid: boolean,
  ): Promise<void> {
    return new Promise((resolve) => {
      const originalImg = gridEl.querySelector(
        `.tc-cell[data-index="${imageIndex}"] img`,
      ) as HTMLImageElement;

      if (!originalImg) return;

      const flightEl = document.createElement("img");
      flightEl.src = originalImg.src;
      flightEl.className = "tc-return-flight";

      Object.assign(flightEl.style, {
        width: `${startRect.width}px`,
        height: `${startRect.height}px`,
        left: `${startRect.left}px`,
        top: `${startRect.top}px`,
        opacity: "1",
        transform: "scale(1)",
      });

      phaseRoot.appendChild(flightEl);

      void flightEl.offsetWidth;

      requestAnimationFrame(() => {
        Object.assign(flightEl.style, {
          left: `${endRect.left}px`,
          top: `${endRect.top}px`,
          width: `${endRect.width}px`,
          height: `${endRect.height}px`,
          opacity: isToGrid ? "0.3" : "1",
          transform: isToGrid ? "scale(0.8)" : "scale(1)",
        });
      });
      setTimeout(() => {
        flightEl.remove();
        resolve();
      }, THEME.duration.returnFlight);
    });
  }

  function removeFromSlot(slotIndex: number) {
    const imageIndex = slots[slotIndex];
    if (imageIndex === null) return;
    const cellEl = gridEl.querySelector(
      `.tc-cell[data-index="${imageIndex}"]`,
    ) as HTMLElement;
    triggerFlight(
      slotEls[slotIndex].getBoundingClientRect(),
      cellEl.getBoundingClientRect(),
      imageIndex,
      true,
    );
    slots[slotIndex] = null;
    renderSlots();
    setTimeout(() => cellEl.classList.remove("is-used"), 400);
  }

  function cleanupPointer() {
    if (activePointerId != null) {
      try {
        phaseRoot.releasePointerCapture(activePointerId);
      } catch {}
    }
    draggingCell?.classList.remove("is-dragging");
    draggingCell = null;

    ghostEl?.remove();
    ghostEl = null;

    slotEls.forEach((s) => s.classList.remove("is-hover"));

    activePointerId = null;
    activeImageIndex = null;
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
