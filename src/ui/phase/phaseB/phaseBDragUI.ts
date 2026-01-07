import { PhaseBGhostManager } from "./phaseBGhostManager";

type DragUIParams = {
  phaseRoot: HTMLElement;
  gridEl: HTMLElement;
  slotEls: HTMLElement[];
  ghost: PhaseBGhostManager;
};

export function createDragUI({
  phaseRoot,
  gridEl,
  slotEls,
  ghost,
}: DragUIParams) {
  /* ---------------------------
   * Picking (집은 대상)
   * ------------------------- */
  function startPicking(targetEl: HTMLElement) {
    phaseRoot
      .querySelectorAll(".is-picking")
      .forEach((el) => el.classList.remove("is-picking"));

    targetEl.classList.add("is-picking");
  }

  function clearPicking() {
    phaseRoot
      .querySelectorAll(".is-picking")
      .forEach((el) => el.classList.remove("is-picking"));
  }

  /* ---------------------------
   * Snapping (드롭 후보)
   * ------------------------- */
  function updateSnapping(slotEl: HTMLElement | null) {
    slotEls.forEach((s) => s.classList.toggle("is-snapping", s === slotEl));
  }

  function clearSnapping() {
    slotEls.forEach((s) => s.classList.remove("is-snapping"));
  }

  /* ---------------------------
   * Drag over grid
   * ------------------------- */
  function updateDragOver(isOver: boolean) {
    gridEl.classList.toggle("is-drag-over", isOver);
  }

  function clearDragOver() {
    gridEl.classList.remove("is-drag-over");
  }

  /* ---------------------------
   * Ghost helpers
   * ------------------------- */
  function attachGhost(rect: DOMRect, img: HTMLImageElement) {
    ghost.create(rect);
    ghost.setImage(img);
  }

  function moveGhost(e: PointerEvent) {
    ghost.move(e);
  }

  function snapGhostTo(rect: DOMRect | null) {
    if (rect) {
      ghost.addClass("is-snapped");
      ghost.moveTo(rect);
    } else {
      ghost.removeClass("is-snapped");
    }
  }

  function removeGhost() {
    ghost.remove();
  }

  /* ---------------------------
   * Cursor / grabbing
   * ------------------------- */
  function setGrabbing(on: boolean) {
    phaseRoot.classList.toggle("is-grabbing", on);
  }

  /* ---------------------------
   * Cleanup policies
   * ------------------------- */

  // pointerup 직후, 즉시 지워도 안전한 UI
  function clearImmediate() {
    clearDragOver();
  }

  // 액션(애니) 완료 후에만 지워야 하는 UI
  function clearAfterAction() {
    clearPicking();
    clearSnapping();
    removeGhost();
  }

  // 강제 리셋 (언마운트, 에러)
  function resetAll() {
    clearImmediate();
    clearAfterAction();
    setGrabbing(false);
  }

  return {
    /* picking */
    startPicking,
    clearPicking,

    /* snapping */
    updateSnapping,
    clearSnapping,

    /* drag over */
    updateDragOver,
    clearDragOver,

    /* ghost */
    attachGhost,
    moveGhost,
    snapGhostTo,
    removeGhost,

    /* cursor */
    setGrabbing,

    /* cleanup */
    clearImmediate,
    clearAfterAction,
    resetAll,
  };
}
