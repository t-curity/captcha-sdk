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
  let ghostEl: HTMLDivElement | null = null;
  let draggingCell: Element | null = null;

  if (!phaseRoot) {
    throw new Error("Phase root not found");
  }

  function onPointerDown(e: PointerEvent) {
    const cell = (e.target as HTMLElement).closest(".tc-cell") as HTMLElement;
    if (!cell || activePointerId !== null) return;

    const index = Number(cell.dataset.index);
    if (slots.includes(index)) return;

    e.preventDefault();

    draggingCell = cell;
    draggingCell.classList.add("is-dragging");
    activePointerId = e.pointerId;
    activeImageIndex = index;

    const { viewport_p, img_p } = getEventCoords(
      e,
      gridEl.getBoundingClientRect(),
    );
    manager.start(viewport_p, img_p);

    createGhost(cell);
    gridEl.setPointerCapture(e.pointerId);
    moveGhost(e);
  }

  function onPointerMove(e: PointerEvent) {
    if (e.pointerId !== activePointerId || !manager.isPressed) return;
    e.preventDefault();

    const { viewport_p, img_p } = getEventCoords(
      e,
      gridEl.getBoundingClientRect(),
    );
    manager.move(viewport_p, img_p);

    moveGhost(e);

    const slot = findSlotByPoint(e.clientX, e.clientY);
    slotEls.forEach((s) => s.classList.toggle("is-hover", s === slot));
  }

  function handleEnd(e: PointerEvent, isCancelled: boolean) {
    if (e.pointerId !== activePointerId || !manager.isPressed) return;

    const { viewport_p, img_p } = getEventCoords(
      e,
      gridEl.getBoundingClientRect(),
    );
    manager.stop(viewport_p, img_p, isCancelled ? "cancel" : "up");

    const slot = findSlotByPoint(e.clientX, e.clientY);

    if (!isCancelled && slot && activeImageIndex !== null) {
      applyDropToSlot(slot, activeImageIndex);
    } else if (draggingCell) {
      const _draggingCell = draggingCell;
      _draggingCell.classList.add("shake");
      setTimeout(
        () => _draggingCell.classList.remove("shake"),
        THEME.duration.shake,
      );
    }

    const selectedIndexes = slots.filter((v): v is number => v !== null);
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

    if (prevImageIndex === imageIndex) return;

    if (prevImageIndex != null) {
      const prevCell = gridEl.querySelector(
        `.tc-cell[data-index="${prevImageIndex}"]`,
      );
      prevCell?.classList.remove("is-used");
    }

    slots[slotIndex] = imageIndex;

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

  function renderSlots() {
    slotEls.forEach((slot, i) => {
      slot.innerHTML = "";
      const imgIndex = slots[i];
      if (imgIndex == null) return;

      const originalImg = gridEl.querySelector(
        `.tc-cell[data-index="${imgIndex}"] img`,
      );

      if (originalImg) {
        slot.appendChild(originalImg.cloneNode(true));
      }
    });
  }

  function cleanupPointer() {
    if (activePointerId != null) {
      try {
        gridEl.releasePointerCapture(activePointerId);
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

  gridEl.addEventListener("pointerdown", onPointerDown);
  gridEl.addEventListener("pointermove", onPointerMove);
  gridEl.addEventListener("lostpointercapture", onLostPointerCapture);
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointercancel", onPointerCancel);

  return () => {
    cleanupPointer();
    gridEl.removeEventListener("pointerdown", onPointerDown);
    gridEl.removeEventListener("pointermove", onPointerMove);
    gridEl.removeEventListener("lostpointercapture", onLostPointerCapture);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerCancel);
  };
}
