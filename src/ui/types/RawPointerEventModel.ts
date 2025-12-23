import type { PointerEventType } from "@/types/contracts/behavior";

export type RawPoint = {
  x: number;
  y: number;
};

export type RawLine = {
  start: RawPoint;
  end: RawPoint;
};

export type RawPointerEvent = {
  img_p: RawPoint;
  viewport_p: RawPoint;
  t: number;
  event_type: PointerEventType;
};
