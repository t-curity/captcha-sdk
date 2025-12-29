import { toastHtml } from "./toast.template";

export function createToastDOM() {
  // HTML → DOM
  const wrapper = document.createElement("div");
  wrapper.innerHTML = toastHtml;

  const container = wrapper.firstElementChild as HTMLDivElement;
  if (!container) {
    throw new Error("toastHtml container not found");
  }

  // Toast
  const toast = container.querySelector(".tc-toast") as HTMLDivElement;
  if (!toast) {
    throw new Error(".tc-toast container not found in toastHtml");
  }

  const showToast = (
    message: string,
    duration = 3000,
    hidden_duration = 300,
  ) => {
    toast.textContent = message;
    toast.hidden = false;

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.hidden = true;
      }, hidden_duration);
    }, duration);
  };

  return {
    container,
    showToast,
  };
}
