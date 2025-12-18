import type { NormalizedPoint } from "@/types/contracts/primitives";

export type PointerEventType = "down" | "move" | "up" | "move_out" | "cancel";

export type PointerEvent = [
  ...NormalizedPoint,
  t: number, // timestamp (ms)
  event_type: PointerEventType,
];

export type PointerEvents = PointerEvent[];
