import { getOverlayRoot } from "@/ui/overlay/overlay";
import { applyShadowStyle } from "@/ui/shadow/applyStyle";
import { loadingCss } from "./loading.style";
import { createLoadingDOM } from "./loading.dom";

export function renderLoading() {
  const overlayRoot = getOverlayRoot();

  applyShadowStyle(overlayRoot, loadingCss, "loading");

  const { container, backdrop, spinner } = createLoadingDOM();
  console.log(container);
  overlayRoot.appendChild(container);

  return () => {
    container.remove();
  };
}
