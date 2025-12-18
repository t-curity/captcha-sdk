import type { PointerEvent } from "@/types/contracts/behavior";
import { RawPointerEvent } from "@/types/input-event/RawPointerEventModel";

export function toViewportPointerEvents(
  raw_points: RawPointerEvent[],
): PointerEvent[] {
  console.log(raw_points);
  return raw_points.map((p) => [p.viewport_x, p.viewport_y, p.t, p.event_type]);
}
