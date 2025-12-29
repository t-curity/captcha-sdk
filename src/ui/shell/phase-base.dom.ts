import { phaseBaseHtml } from "./phase-base.template";

export function createPhaseBaseDOM() {
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
  const fills = Array.from(
    root.querySelectorAll(".tc-phase-bar__fill"),
  ) as HTMLDivElement[];

  function setPhasePercents(percents: number[]) {
    percents.forEach((percent, index) => {
      const p = Math.max(0, Math.min(100, percent));
      fills[index].style.width = `${p}%`;
    });
  }

  return {
    root, // overlay에 append
    body, // Phase DOM을 append
    closeBtn, // abort 연결용
    setPhasePercents,
  };
}
