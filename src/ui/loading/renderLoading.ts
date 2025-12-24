import { getOverlayRoot } from "@/ui/overlay/overlay";
import { applyShadowStyle } from "@/ui/shadow/applyStyle";
import { loadingCss } from "./loading.style";

export function renderLoading() {
  const overlay = getOverlayRoot();

  applyShadowStyle(overlay, loadingCss, "loading");

  const el = document.createElement("div");
  el.className = "tc-loading";
  el.innerHTML = `
    <div class="tc-loading-backdrop"></div>
    <div class="tc-loading-spinner"></div>
  `;

  overlay.appendChild(el);

  return () => {
    el.remove();
  };
}
