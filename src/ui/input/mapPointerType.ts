import { PointerEventType } from "@/types/contracts/behavior";

export function mapPointerType(e: PointerEvent): PointerEventType {
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
