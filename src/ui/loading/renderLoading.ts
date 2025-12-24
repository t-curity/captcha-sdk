import { getOverlayRoot } from "@/ui/overlay/overlay";
import { applyShadowStyle } from "@/ui/shadow/applyStyle";
import { loadingCss } from "./loading.style";
import { createLoadingDOM } from "./loading.dom";
import { getOverlayShadowRoot } from "../overlay/overlay.dom";

export function renderLoading() {
  const stage = getOverlayRoot();
  const shadowRoot = getOverlayShadowRoot();

  applyShadowStyle(shadowRoot, loadingCss, "loading");

  const { container } = createLoadingDOM();
  stage.appendChild(container);

  return () => {
    container.remove();
  };
}
