import { ImageGrid } from "@/types/contracts/primitives";
import { phaseBHtml } from "./phaseB.template";

export function createPhaseBDOM(
  targetClass: string,
  grid: ImageGrid,
  slotCount: number = 4,
) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = phaseBHtml;

  const container = wrapper.firstElementChild as HTMLDivElement;
  if (!container) throw new Error("phaseB root not found");

  const questionEl = container.querySelector(".tc-question") as HTMLDivElement;
  const gridEl = container.querySelector(".tc-grid") as HTMLDivElement;
  const slotsEl = container.querySelector(
    ".tc-phase-b-slots",
  ) as HTMLDivElement;

  if (!questionEl || !gridEl || !slotsEl) {
    throw new Error("phaseB DOM structure mismatch");
  }

  // target_class 표시 (instruction은 템플릿에 고정)
  const targetClassEl = container.querySelector(".tc-target-class") as HTMLDivElement;
  if (targetClassEl) {
    targetClassEl.textContent = targetClass;
  }

  // Grid
  grid.forEach((item, idx) => {
    const cell = document.createElement("div");
    cell.className = "tc-cell";
    cell.dataset.index = String(idx);

    const img = document.createElement("img");
    img.draggable = false;
    img.src = item.image.startsWith("data:")
      ? item.image
      : `data:image/jpeg;base64,${item.image}`;

    img.draggable = false;
    img.addEventListener("dragstart", (ev) => ev.preventDefault());

    cell.appendChild(img);
    gridEl.appendChild(cell);
  });

  // Slots
  const slotEls: HTMLDivElement[] = [];
  for (let i = 0; i < slotCount; i++) {
    const slot = document.createElement("div");
    slot.className = "tc-phase-b-slot";
    slot.dataset.slot = String(i);

    const img = document.createElement("img");
    slot.appendChild(img);

    const removeBadge = document.createElement("div");
    removeBadge.className = "tc-remove-badge";
    removeBadge.innerHTML = "✕";
    slot.appendChild(removeBadge);

    slotsEl.appendChild(slot);
    slotEls.push(slot);
  }

  return {
    container,
    gridEl,
    slotEls,
  };
}
