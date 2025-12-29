import { overlayTemplate } from "./overlay.template";
import { applyShadowStyle } from "@/ui/shadow/applyStyle";
import { overlayCss } from "./overlay.style";

let hostEl: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;

export function createOverlayHost(): ShadowRoot {
  if (hostEl) return shadowRoot!;

  hostEl = document.createElement("div");
  hostEl.id = "tcurity-overlay-host";

  shadowRoot = hostEl.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = overlayTemplate;

  applyShadowStyle(shadowRoot, overlayCss, "overlay");

  shadowRoot.addEventListener(
    "dragstart",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    },
    { capture: true, passive: false },
  );

  document.body.appendChild(hostEl);
  document.body.style.overflow = "hidden";

  return shadowRoot;
}

export function destroyOverlayHost() {
  if (!hostEl) return;

  hostEl.remove();
  hostEl = null;
  shadowRoot = null;
  document.body.style.overflow = "";
}

export function getOverlayStage(): HTMLElement {
  if (!shadowRoot) throw new Error("Overlay not initialized");

  const stage = shadowRoot.querySelector(".tc-overlay-stage") as HTMLElement;

  if (!stage) throw new Error("Overlay stage not found");

  return stage;
}
