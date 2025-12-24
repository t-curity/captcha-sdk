import { phaseBHtml } from "./phaseB.template";

export function createPhaseBDOM(question: string, slotCount: number = 4) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = phaseBHtml;

  const container = wrapper.firstElementChild as HTMLDivElement;
  if (!container) throw new Error("phaseB root not found");

  const questionEl = container.querySelector(".tc-question") as HTMLDivElement;
  const gridEl = container.querySelector(".tc-grid") as HTMLDivElement;
  const slotsEl = container.querySelector(".tc-slots") as HTMLDivElement;

  if (!questionEl || !gridEl || !slotsEl) {
    throw new Error("phaseB DOM structure mismatch");
  }

  questionEl.textContent = question;

  const slotEls: HTMLDivElement[] = [];
  for (let i = 0; i < slotCount; i++) {
    const slot = document.createElement("div");
    slot.className = "tc-slot";
    slot.dataset.slot = String(i);
    slotsEl.appendChild(slot);
    slotEls.push(slot);
  }

  return {
    container,
    gridEl,
    slotEls,
  };
}
