import { applyShadowStyle, removeShadowStyle } from "../shadow/applyStyle";
import {
  createOverlayHost,
  destroyOverlayHost,
  getOverlayStage,
} from "./overlay.dom";
import { emitOverlayDismiss } from "./overlay.events";
import { overlayCss } from "./overlay.style";

export interface OverlayContext {
  shadow: ShadowRoot;
  stage: HTMLElement;
}

function onPopState() {
  emitOverlayDismiss("NAVIGATE");
}

function preventDrag(e: Event) {
  e.preventDefault();
  e.stopPropagation();

  return false;
}

export function showOverlay(): OverlayContext {
  // 1. 호스트 생성 및 쉐도우 루트 확보
  const shadow = createOverlayHost();
  // 2. 실제 Phase가 그려질 무대(Stage) 확보
  const stage = getOverlayStage();

  applyShadowStyle(shadow, overlayCss, "overlay");

  shadow.addEventListener("dragstart", preventDrag, {
    capture: true,
    passive: false,
  });
  window.addEventListener("popstate", onPopState);

  return { shadow, stage };
}

export function hideOverlay() {
  destroyOverlayHost((shadow) => {
    shadow.removeEventListener("dragstart", preventDrag, { capture: true });
    removeShadowStyle(shadow, "overlay");
  });
  window.removeEventListener("popstate", onPopState);
}

export { onOverlayDismiss } from "./overlay.events";
