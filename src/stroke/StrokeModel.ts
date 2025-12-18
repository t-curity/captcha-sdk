import type { PointerEventType } from "@/api/captcha.types";

export type StrokePoint = {
  x: number; // 0..1
  y: number; // 0..1
  t: number;
  event_type: PointerEventType;
};

export type StrokeModel = {
  points: StrokePoint[];
  color: string;
};
