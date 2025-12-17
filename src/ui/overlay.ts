let overlayEl: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;

export function showOverlay() {
  if (overlayEl) return;

  overlayEl = document.createElement("div");
  overlayEl.id = "tcurity-overlay-host"; // ⭐ 중요
  overlayEl.style.position = "fixed";
  overlayEl.style.inset = "0";
  overlayEl.style.background = "rgba(0,0,0,0.4)";
  overlayEl.style.zIndex = "9999";
  overlayEl.style.display = "flex";
  overlayEl.style.alignItems = "center";
  overlayEl.style.justifyContent = "center";

  shadowRoot = overlayEl.attachShadow({ mode: "open" });

  document.body.appendChild(overlayEl);
  document.body.style.overflow = "hidden";
}

export function hideOverlay() {
  if (!overlayEl) return;

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
