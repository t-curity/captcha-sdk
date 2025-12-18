import type { PointerEventType } from "@/types/contracts/behavior";

export type RawPointerEvent = {
  img_x: number;
  img_y: number;
  viewport_x: number;
  viewport_y: number;
  t: number;
  event_type: PointerEventType;
};
