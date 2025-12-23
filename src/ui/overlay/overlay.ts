let overlayEl: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;

const listeners = new Set<(reason: "NAVIGATE") => void>();

export function onOverlayDismiss(cb: (reason: "NAVIGATE") => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emitDismiss(reason: "NAVIGATE") {
  for (const cb of listeners) cb(reason);
}

function onPopState() {
  // overlay는 직접 abort를 모름. 이벤트만 발행.
  emitDismiss("NAVIGATE");
}

export function showOverlay() {
  if (overlayEl) return;

  overlayEl = document.createElement("div");
  overlayEl.id = "tcurity-overlay-host";
  overlayEl.style.position = "fixed";
  overlayEl.style.inset = "0";
  overlayEl.style.background = "rgba(0,0,0,0.4)";
  overlayEl.style.backdropFilter = "blur(6px)";
  overlayEl.style.setProperty("-webkit-backdrop-filter", "blur(6px)");
  overlayEl.style.zIndex = "9999";
  overlayEl.style.display = "flex";
  overlayEl.style.alignItems = "center";
  overlayEl.style.justifyContent = "center";

  shadowRoot = overlayEl.attachShadow({ mode: "open" });

  document.body.appendChild(overlayEl);
  document.body.style.overflow = "hidden";

  window.addEventListener("popstate", onPopState);
}

export function hideOverlay() {
  if (!overlayEl) return;

  window.removeEventListener("popstate", onPopState);

  overlayEl.remove();
  overlayEl = null;
  shadowRoot = null;
  document.body.style.overflow = "";
}

export function getOverlayRoot(): ShadowRoot {
  if (!shadowRoot) {
    throw new Error("Overlay not initialized");
  }
  return shadowRoot;
}
