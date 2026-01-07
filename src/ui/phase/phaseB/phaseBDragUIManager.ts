import { PhaseBGhostManager } from "./phaseBGhostManager";

export class PhaseBDragUIManager {
  constructor(
    private phaseRoot: HTMLElement,
    private gridEl: HTMLElement,
    private slotEls: HTMLElement[],
    private ghost: PhaseBGhostManager,
  ) {}
  /* ---------------------------
   * Picking (집은 대상)
   * ------------------------- */
  startPicking(targetEl: HTMLElement) {
    this.phaseRoot
      .querySelectorAll(".is-picking")
      .forEach((el) => el.classList.remove("is-picking"));

    targetEl.classList.add("is-picking");
  }

  clearPicking() {
    this.phaseRoot
      .querySelectorAll(".is-picking")
      .forEach((el) => el.classList.remove("is-picking"));
  }

  /* ---------------------------
   * Snapping (드롭 후보)
   * ------------------------- */
  updateSnapping(slotEl: HTMLElement | null) {
    this.slotEls.forEach((s) =>
      s.classList.toggle("is-snapping", s === slotEl),
    );
  }

  clearSnapping() {
    this.slotEls.forEach((s) => s.classList.remove("is-snapping"));
  }

  /* ---------------------------
   * Drag over grid
   * ------------------------- */
  updateDragOver(isOver: boolean) {
    this.gridEl.classList.toggle("is-drag-over", isOver);
  }

  clearDragOver() {
    this.gridEl.classList.remove("is-drag-over");
  }

  /* ---------------------------
   * Ghost helpers
   * ------------------------- */
  attachGhost(rect: DOMRect, img: HTMLImageElement) {
    this.ghost.create(rect);
    this.ghost.setImage(img);
  }

  moveGhost(e: PointerEvent) {
    this.ghost.move(e);
  }

  snapGhostTo(rect: DOMRect | null) {
    if (rect) {
      this.ghost.addClass("is-snapped");
      this.ghost.moveTo(rect);
    } else {
      this.ghost.removeClass("is-snapped");
    }
  }

  removeGhost() {
    this.ghost.remove();
  }

  /* ---------------------------
   * Cursor / grabbing
   * ------------------------- */
  setGrabbing(on: boolean) {
    this.phaseRoot.classList.toggle("is-grabbing", on);
  }

  /* ---------------------------
   * Cleanup policies
   * ------------------------- */

  // pointerup 직후, 즉시 지워도 안전한 UI
  clearImmediate() {
    this.clearDragOver();
  }

  // 액션(애니) 완료 후에만 지워야 하는 UI
  clearAfterAction() {
    this.clearPicking();
    this.clearSnapping();
    this.removeGhost();
  }

  // 강제 리셋 (언마운트, 에러)
  resetAll() {
    this.clearImmediate();
    this.clearAfterAction();
    this.setGrabbing(false);
  }
}
