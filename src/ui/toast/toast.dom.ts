import { toastHtml } from "./toast.template";

export function createToastDOM() {
  // HTML → DOM
  const wrapper = document.createElement("div");
  wrapper.innerHTML = toastHtml;
  const container = wrapper.firstElementChild as HTMLDivElement;
  if (!container) {
    throw new Error("toastHtml container not found");
  }

  return {
    container,
  };
}
