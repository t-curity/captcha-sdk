import { phaseAHtml } from "./phaseA.template";

export function createPhaseADOM(guideText: string) {
  const container = document.createElement("div");
  container.innerHTML = phaseAHtml;

  const root = container.firstElementChild as HTMLElement;
  const slot = root.querySelector(".tc-slot") as HTMLDivElement;
  const guide = root.querySelector(".tc-guide-text") as HTMLDivElement;

  guide.textContent = guideText;

  return { container: root, slot };
}
