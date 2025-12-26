import {
  createOverlayHost,
  destroyOverlayHost,
  getOverlayStage,
} from "./overlay.dom";
import { emitOverlayDismiss } from "./overlay.events";

export interface OverlayContext {
  shadow: ShadowRoot;
  stage: HTMLElement;
}

function onPopState() {
  emitOverlayDismiss("NAVIGATE");
}

export function showOverlay(): OverlayContext {
  // 1. 호스트 생성 및 쉐도우 루트 확보
  const shadow = createOverlayHost();
  // 2. 실제 Phase가 그려질 무대(Stage) 확보
  const stage = getOverlayStage();

  window.addEventListener("popstate", onPopState);

  return { shadow, stage };
}

export function hideOverlay() {
  window.removeEventListener("popstate", onPopState);
  destroyOverlayHost();
}

export { onOverlayDismiss } from "./overlay.events";
