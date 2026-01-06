import { sleep } from "@/utils/sleep";

export type GhostRect = { width: number; height: number };
export class PhaseBGhostManager {
  private ghostEl: HTMLDivElement | null = null;
  private ghostRect: GhostRect | null = null;

  constructor(private phaseRoot: HTMLElement) {}

  create(rect: GhostRect) {
    this.remove();

    this.ghostRect = rect;

    this.ghostEl = document.createElement("div");
    this.ghostEl.className = "tc-drag-ghost";

    Object.assign(this.ghostEl.style, {
      width: `${this.ghostRect.width}px`,
      height: `${this.ghostRect.height}px`,
    });

    this.phaseRoot.appendChild(this.ghostEl);
  }

  hasGhost() {
    return !!this.ghostEl;
  }

  setImage(img: HTMLImageElement) {
    if (!this.ghostEl) return;

    this.ghostEl.querySelector("img")?.remove();
    this.ghostEl.appendChild(img.cloneNode(true));
  }

  move(e: PointerEvent) {
    if (!this.ghostEl || !this.ghostRect) return;
    const rootRect = this.phaseRoot.getBoundingClientRect();

    this.ghostEl.style.left = `${e.clientX - rootRect.left - this.ghostRect.width / 2}px`;
    this.ghostEl.style.top = `${e.clientY - rootRect.top - this.ghostRect.height / 2}px`;
  }

  moveTo(rect: DOMRect) {
    if (!this.ghostEl || !rect || !this.ghostRect) return;
    const rootRect = this.phaseRoot.getBoundingClientRect();

    this.ghostEl.style.left = `${rect.left - rootRect.left + rect.width / 2 - this.ghostRect.width / 2}px`;
    this.ghostEl.style.top = `${rect.top - rootRect.top + rect.height / 2 - this.ghostRect.height / 2}px`;
  }

  remove() {
    this.ghostEl?.remove();
    this.ghostEl = null;
    this.ghostRect = null;
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
    originalImg: HTMLImageElement,
    isToGrid: boolean,
    duration: number = 300,
  ) {
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
