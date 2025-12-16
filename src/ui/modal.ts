import { getOverlayRoot } from "./overlay";

export function showModal(): {
  destroy: () => void;
  onClose: (handler: () => void) => void;
} {
  const root = getOverlayRoot();
  if (!root) {
    return {
      destroy: () => {},
      onClose: () => {},
    };
  }

  const box = document.createElement("div");
  box.style.width = "360px";
  box.style.height = "200px";
  box.style.background = "#fff";
  box.style.borderRadius = "8px";
  box.style.position = "relative";
  box.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
  box.style.display = "flex";
  box.style.alignItems = "center";
  box.style.justifyContent = "center";
  box.innerText = "CAPTCHA 준비 중";

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "×";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "8px";
  closeBtn.style.right = "8px";
  closeBtn.style.border = "none";
  closeBtn.style.background = "transparent";
  closeBtn.style.fontSize = "20px";
  closeBtn.style.cursor = "pointer";

  box.appendChild(closeBtn);
  root.appendChild(box);

  let closeHandler: (() => void) | null = null;

  closeBtn.onclick = (e) => {
    e.stopPropagation();
    closeHandler?.();
  };

  return {
    onClose(handler: () => void) {
      closeHandler = handler;
    },
    destroy() {
      box.remove();
    },
  };
}
