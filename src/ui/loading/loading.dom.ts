import { loadingHtml } from "./loading.template";

export function createLoadingDOM(guideText: string) {
  const container = document.createElement("div");
  container.innerHTML = loadingHtml;

  const root = container.firstElementChild as HTMLElement;
  const backdrop = root.querySelector(".tc-loading-backdrop") as HTMLDivElement;
  const spinner = root.querySelector(".tc-loading-spinner") as HTMLDivElement;

  return { container: root, backdrop, spinner };
}
