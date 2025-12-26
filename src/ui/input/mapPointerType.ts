import { UIPointerEventType } from "./types";

export function mapPointerType(e: PointerEvent): UIPointerEventType {
  switch (e.type) {
    case "pointerdown":
      return "down";
    case "pointermove":
      return "move";
    case "pointerup":
      return "up";
    case "pointercancel":
      return "cancel";
    case "pointerleave":
    case "pointerout":
      return "move_out";
    default:
      return "move";
  }
}
