import { AbortReason } from "@/types/contracts/phase-results";
import { mapPointerType } from "@/ui/input/mapPointerType";
import type { RawPointerEvent } from "@/ui/types/RawPointerEventModel";

type PhaseBInputParams = {
  gridEl: HTMLDivElement;
  slotEls: HTMLElement[];
  maxSelect: number;
  onPass: (data: { selected: number[]; raw_points: RawPointerEvent[] }) => void;
  onAbort: (reason: AbortReason) => void;
};

export function usePhaseBInput({
  gridEl,
  slotEls,
  maxSelect,
  onPass,
  onAbort,
}: PhaseBInputParams) {
  const slots: Array<number | null> = new Array(slotEls.length).fill(null);
  const segments: RawPointerEvent[][] = [];
  const phaseRoot = gridEl.closest(".tc-phase-root") as HTMLElement;

  let activePointerId: number | null = null;
  let currentSegment: RawPointerEvent[] | null = null;
  let activeImageIndex: number | null = null;
  let ghostEl: HTMLDivElement | null = null;
  let draggingCell: Element | null = null;

  if (!phaseRoot) {
    throw new Error("Phase root not found");
  }

  function push(e: PointerEvent) {
    const rect = gridEl.getBoundingClientRect();

    currentSegment!.push({
      viewport_p: {
        x: e.clientX,
        y: e.clientY,
      },
      img_p: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
      t: performance.now(),
      event_type: mapPointerType(e),
    });
  }

  function onPointerDown(e: PointerEvent) {
    //console.log("pointerdown target", e.target);
    e.preventDefault();

    const cell = (e.target as HTMLElement).closest(".tc-cell") as HTMLElement;
    if (!cell) return;

    const index = Number(cell.dataset.index);
    if (slots.includes(index)) return;

    draggingCell = cell;
    draggingCell.classList.add("is-dragging");

    ghostEl = document.createElement("div");
    ghostEl.className = "tc-drag-ghost";

    const img = cell.querySelector("img")!.cloneNode(true) as HTMLImageElement;
    ghostEl.appendChild(img);
    phaseRoot.appendChild(ghostEl);

    activePointerId = e.pointerId;
    activeImageIndex = index;
    currentSegment = [];

    gridEl.setPointerCapture(e.pointerId);
    push(e);
    moveGhost(e);
  }

  function onPointerMove(e: PointerEvent) {
    if (e.pointerId !== activePointerId || !currentSegment) return;
    e.preventDefault();

    push(e);
    moveGhost(e);

    // 슬롯 hover 표시function onPointerMove(e: PointerEvent) {
    if (e.pointerId !== activePointerId || !currentSegment) return;
    e.preventDefault();

    push(e);
    moveGhost(e);

    const slot = findSlotByPoint(e.clientX, e.clientY);
    slotEls.forEach((s) => s.classList.toggle("is-hover", s === slot));
  }

  function onPointerUp(e: PointerEvent) {
    if (e.pointerId !== activePointerId || !currentSegment) return;

    push(e);
    segments.push(currentSegment);

    const slot = findSlotByPoint(e.clientX, e.clientY);
    slotEls.forEach((s) => s.classList.toggle("is-hover", s === slot));

    if (!slot) {
      draggingCell?.classList.add("shake");
      setTimeout(() => draggingCell?.classList.remove("shake"), 300);
    } else if (activeImageIndex !== null) {
      applyDropToSlot(slot, activeImageIndex);
    }

    cleanupPointer(e);

    if (slots.filter((v) => v !== null).length === maxSelect) {
      onPass({
        selected: slots.filter((v) => v !== null) as number[],
        raw_points: segments.flat(),
      });
    }
  }

  function moveGhost(e: PointerEvent) {
    if (!ghostEl) return;
    const rootRect = phaseRoot.getBoundingClientRect();
    //console.log("rootRect", rootRect);
    ghostEl.style.left = `${e.clientX - rootRect.left - 36}px`;
    ghostEl.style.top = `${e.clientY - rootRect.top - 36}px`;
  }

  function applyDropToSlot(slotEl: HTMLDivElement, imageIndex: number) {
    const slotIndex = Number(slotEl.dataset.slot);
    const prevImageIndex = slots[slotIndex];

    if (prevImageIndex === imageIndex) return;

    if (prevImageIndex != null) {
      // 교환: 이전 이미지의 source 복구
      const prevCell = gridEl.querySelector(
        `.tc-cell[data-index="${prevImageIndex}"]`,
      );
      prevCell?.classList.remove("is-used");
    }

    // 새 이미지 배치
    slots[slotIndex] = imageIndex;

    // source에서 제거 표시
    const cell = gridEl.querySelector(`.tc-cell[data-index="${imageIndex}"]`);
    cell?.classList.add("is-used");

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

  function cleanupPointer(e: PointerEvent) {
    draggingCell?.classList.remove("is-dragging");
    draggingCell = null;

    ghostEl?.remove();
    ghostEl = null;

    slotEls.forEach((s) => s.classList.remove("is-hover"));

    gridEl.releasePointerCapture(e.pointerId);
    activePointerId = null;
    activeImageIndex = null;
    currentSegment = null;
  }

  function onPointerCancel(e: PointerEvent) {
    cleanupPointer(e);
    onAbort("CANCEL");
  }

  function renderSlots() {
    slotEls.forEach((slot, i) => {
      slot.innerHTML = "";
      const imgIndex = slots[i];
      if (imgIndex == null) return;

      const img = gridEl
        .querySelector(`.tc-cell[data-index="${imgIndex}"] img`)!
        .cloneNode(true) as HTMLImageElement;

      const badge = document.createElement("div");
      badge.className = "tc-slot-order";
      badge.textContent = String(i + 1);

      slot.appendChild(img);
      slot.appendChild(badge);
    });
  }

  gridEl.addEventListener("pointerdown", onPointerDown);
  gridEl.addEventListener("pointermove", onPointerMove);
  gridEl.addEventListener("pointerup", onPointerUp);
  gridEl.addEventListener("pointercancel", onPointerCancel);

  return () => {
    gridEl.removeEventListener("pointerdown", onPointerDown);
    gridEl.removeEventListener("pointermove", onPointerMove);
    gridEl.removeEventListener("pointerup", onPointerUp);
    gridEl.removeEventListener("pointercancel", onPointerCancel);
  };
}
