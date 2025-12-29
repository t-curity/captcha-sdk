import { phaseBaseHtml } from "./toast.template";

export function createToastDOM() {
  // HTML → DOM
  const wrapper = document.createElement("div");
  wrapper.innerHTML = phaseBaseHtml;

  const root = wrapper.firstElementChild as HTMLDivElement;
  if (!root) {
    throw new Error("phaseBaseHtml root not found");
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

  return {
    root,
    showToast,
  };
}
