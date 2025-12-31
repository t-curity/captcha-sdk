import { sleep } from "@/utils/sleep";

export class PhaseBGhostManager {
  private ghostEl: HTMLDivElement | null = null;

  constructor(
    private phaseRoot: HTMLElement,
    private gridEl: HTMLElement,
  ) {}

  create(cell: HTMLElement) {
    this.ghostEl = document.createElement("div");
    this.ghostEl.className = "tc-drag-ghost";
    const img = cell.querySelector("img")!.cloneNode(true) as HTMLImageElement;
    this.ghostEl.appendChild(img);
    this.phaseRoot.appendChild(this.ghostEl);
  }

  move(e: PointerEvent) {
    if (!this.ghostEl) return;
    const rootRect = this.phaseRoot.getBoundingClientRect();

    this.ghostEl.style.left = `${e.clientX - rootRect.left - 36}px`;
    this.ghostEl.style.top = `${e.clientY - rootRect.top - 36}px`;
  }

  moveTo(rect: DOMRect) {
    if (!this.ghostEl || !rect) return;
    const rootRect = this.phaseRoot.getBoundingClientRect();

    this.ghostEl.style.left = `${rect.left - rootRect.left + rect.width / 2 - 36}px`;
    this.ghostEl.style.top = `${rect.top - rootRect.top + rect.height / 2 - 36}px`;
  }

  remove() {
    this.ghostEl?.remove();
    this.ghostEl = null;
  }

  getRect() {
    return this.ghostEl?.getBoundingClientRect();
  }

  addClass(className: string) {
    this.ghostEl?.classList.add(className);
  }

  removeClass(className: string) {
    this.ghostEl?.classList.remove(className);
  }

  async triggerFlight(
    startRect: DOMRect,
    endRect: DOMRect,
    imageIndex: number,
    isToGrid: boolean,
    duration: number = 300,
  ) {
    const originalImg = this.gridEl.querySelector(
      `.tc-cell[data-index="${imageIndex}"] img`,
    ) as HTMLImageElement;
    if (!originalImg) return;

    const rootRect = this.phaseRoot.getBoundingClientRect();
    const flightEl = document.createElement("img");
    flightEl.src = originalImg.src;
    flightEl.className = "tc-return-flight";
    Object.assign(flightEl.style, {
      width: `${startRect.width}px`,
      height: `${startRect.height}px`,
      left: `${startRect.left - rootRect.left}px`,
      top: `${startRect.top - rootRect.top}px`,
      opacity: "1",
      transform: "scale(1)",
    });

    this.phaseRoot.appendChild(flightEl);
    void flightEl.offsetWidth; // Force Reflow

    requestAnimationFrame(() => {
      Object.assign(flightEl.style, {
        left: `${endRect.left - rootRect.left}px`,
        top: `${endRect.top - rootRect.top}px`,
        width: `${endRect.width}px`,
        height: `${endRect.height}px`,
        opacity: isToGrid ? "0.3" : "1",
        transform: isToGrid ? "scale(0.8)" : "scale(1)",
      });
    });

    await sleep(duration);
    flightEl.remove();
  }
}
