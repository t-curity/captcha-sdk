import type { PointerEventType } from "@/types/contracts/behavior";
import type { UIPointerEventType } from "@/ui/input/types";

export function encodePointerType(type: UIPointerEventType): PointerEventType {
  return type;
}
