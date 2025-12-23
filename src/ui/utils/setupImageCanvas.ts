export function setupImageCanvas(slot: HTMLElement, base64Image: string) {
  const img = document.createElement("img");
  img.src = `data:image/png;base64,${base64Image}`;
  img.style.userSelect = "none";
  img.draggable = false;

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.pointerEvents = "none";

  slot.appendChild(img);
  slot.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;

  const syncSize = () => {
    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    return rect;
  };

  img.onload = syncSize;
  window.addEventListener("resize", syncSize);

  return {
    img,
    canvas,
    ctx,
    syncSize,
    cleanup() {
      window.removeEventListener("resize", syncSize);
      img.remove();
      canvas.remove();
    },
  };
}
