import { RawPoint } from "@/types/input-event/RawPointerEventModel";

export function toImageCoords(e: PointerEvent, rect: DOMRect): RawPoint {
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}
