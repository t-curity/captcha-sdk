import { RawPoint } from "@/ui/input/raw";

export function toImageCoords(e: PointerEvent, rect: DOMRect): RawPoint {
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}
