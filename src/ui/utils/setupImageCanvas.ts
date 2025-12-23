import { Base64 } from "@/types/contracts/primitives";

export function setupImageCanvas(slot: HTMLElement, image: Base64) {
  const img = document.createElement("img");
  img.src = `data:image/png;base64,${image}`;
  img.style.userSelect = "none";
  img.draggable = false;

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.pointerEvents = "none";

  slot.appendChild(img);
  slot.appendChild(canvas);

  const ctx = canvas.getContext("2d", { alpha: true })!;
  let ready = false;
  const readyCallbacks: Array<() => void> = [];

  function syncCanvasSize(): boolean {
    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    return true;
  }

  function tryReady() {
    requestAnimationFrame(() => {
      if (ready) return;

      if (syncCanvasSize()) {
        ready = true;
        readyCallbacks.splice(0).forEach((cb) => cb());
      } else {
        tryReady();
      }
    });
  }

  if (img.complete) {
    tryReady();
  } else {
    img.addEventListener("load", tryReady, { once: true });
  }

  function onReady(cb: () => void) {
    if (ready) {
      cb();
    } else {
      readyCallbacks.push(cb);
    }
  }

  function getImageLocalRect(): DOMRect {
    const imgRect = img.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    console.log("getImageLocalRect", imgRect, slotRect);

    return new DOMRect(
      imgRect.left - slotRect.left,
      imgRect.top - slotRect.top,
      imgRect.width,
      imgRect.height,
    );
  }

  return {
    img,
    canvas,
    ctx,
    onReady,
    getImageLocalRect,
    cleanup() {
      img.removeEventListener("load", tryReady);
      img.remove();
      canvas.remove();
    },
  };
}
