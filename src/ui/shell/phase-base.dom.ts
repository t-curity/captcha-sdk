import { phaseBaseHtml } from "./phase-base.template";

export function createPhaseBaseDOM(total_phases: number = 4) {
  // HTML → DOM
  const wrapper = document.createElement("div");
  wrapper.innerHTML = phaseBaseHtml;

  const root = wrapper.firstElementChild as HTMLDivElement;
  if (!root) {
    throw new Error("phaseBaseHtml root not found");
  }

  // body (Phase A/B가 들어갈 자리)
  const body = root.querySelector(".tc-body") as HTMLDivElement;
  if (!body) {
    throw new Error(".tc-body not found in phaseBaseHtml");
  }

  // close 버튼
  const closeBtn = root.querySelector(".tc-close") as HTMLButtonElement;
  if (!closeBtn) {
    throw new Error(".tc-close not found in phaseBaseHtml");
  }

  // 진행바
  const barsContainer = root.querySelector(".tc-phase-bars") as HTMLDivElement;
  barsContainer.innerHTML = "";

  for (let i = 0; i < total_phases; i++) {
    const bar = document.createElement("div");
    bar.className = "tc-phase-bar";
    bar.innerHTML = `<div class="tc-phase-bar__fill"></div>`;
    barsContainer.appendChild(bar);
  }

  const fills = Array.from(
    root.querySelectorAll(".tc-phase-bar__fill"),
  ) as HTMLDivElement[];

  function setPhasePercents(percents: number[]) {
    percents.forEach((percent, index) => {
      if (fills[index]) {
        const p = Math.max(0, Math.min(100, percent));
        fills[index].style.width = `${p}%`;
      }
    });
  }

  return {
    root, // overlay에 append
    body, // Phase DOM을 append
    closeBtn, // abort 연결용
    setPhasePercents,
  };
}
