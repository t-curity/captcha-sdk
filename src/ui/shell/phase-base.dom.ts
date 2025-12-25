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

  // Toast
  const toast = root.querySelector(".tc-toast") as HTMLDivElement;

  // 토스트 띄우는 헬퍼 함수
  const showToast = (message: string, duration = 3000) => {
    toast.textContent = message;
    toast.hidden = false;

    // 애니메이션을 위해 약간의 지연 후 클래스 추가
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      // 페이드아웃 끝난 뒤 hidden 처리
      setTimeout(() => {
        toast.hidden = true;
      }, 300);
    }, duration);
  };

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
    showToast,
  };
}
