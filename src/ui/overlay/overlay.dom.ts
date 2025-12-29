import { overlayTemplate } from "./overlay.template";

let hostEl: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let originalOverflow = "";

export function createOverlayHost(): ShadowRoot {
  if (hostEl) return shadowRoot!;

  hostEl = document.createElement("div");
  hostEl.id = "tcurity-overlay-host";

  shadowRoot = hostEl.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = overlayTemplate;

  document.body.appendChild(hostEl);

  originalOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  return shadowRoot;
}

export function destroyOverlayHost(destroy: (ShadowRoot: ShadowRoot) => void) {
  if (!hostEl) return;

  if (shadowRoot) {
    destroy(shadowRoot);
    shadowRoot = null;
  }
  hostEl.remove();
  hostEl = null;
  document.body.style.overflow = originalOverflow;
}

export function getOverlayStage(): HTMLElement {
  if (!shadowRoot) throw new Error("Overlay not initialized");

  const stage = shadowRoot.querySelector(".tc-overlay-stage") as HTMLElement;

  if (!stage) throw new Error("Overlay stage not found");

  return stage;
}
