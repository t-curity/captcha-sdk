import { loadingCss } from "./loading.style";
import { createLoadingDOM } from "./loading.dom";
import { phaseBaseShell } from "../shell";

export function renderLoading(shell: phaseBaseShell) {
  const { container } = createLoadingDOM();
  shell.mountLoading(container);

  shell.applyStyle(loadingCss, "loading");

  return () => {
    shell.hideLoading();
  };
}
