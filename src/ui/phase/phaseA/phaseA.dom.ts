import { phaseAHtml } from "./phaseA.template";

export function createPhaseADOM(guideText: string) {
  const container = document.createElement("div");
  container.innerHTML = phaseAHtml;

  const root = container.firstElementChild as HTMLElement;
  const slot = root.querySelector(".tc-phase-a-slot") as HTMLDivElement;
  const guide = root.querySelector(".tc-guide-text") as HTMLDivElement;
  const dragHandle = root.querySelector(".tc-drag-handle") as HTMLDivElement;

  guide.textContent = guideText;

  return { container: root, slot, dragHandle };
}
