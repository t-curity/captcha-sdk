import {
  createOverlayHost,
  destroyOverlayHost,
  getOverlayStage,
} from "./overlay.dom";
import { emitOverlayDismiss } from "./overlay.events";

function onPopState() {
  emitOverlayDismiss("NAVIGATE");
}

export function showOverlay() {
  createOverlayHost();
  window.addEventListener("popstate", onPopState);
}

export function hideOverlay() {
  window.removeEventListener("popstate", onPopState);
  destroyOverlayHost();
}

export function getOverlayRoot(): HTMLElement {
  return getOverlayStage();
}

export { onOverlayDismiss } from "./overlay.events";
