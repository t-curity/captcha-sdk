import { RawPoint } from "@/ui/input/raw";

export function toImageCoords(e: PointerEvent, rect: DOMRect): RawPoint {
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

export function getEventCoords(e: PointerEvent, rect: DOMRect) {
  return {
    viewport_p: {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    },
    img_p: toImageCoords(e, rect),
  };
}
