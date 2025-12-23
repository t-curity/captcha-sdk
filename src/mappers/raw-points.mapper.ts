import type { PointerEvent } from "@/types/contracts/behavior";
import { RawPointerEvent } from "@/ui/types/RawPointerEventModel";

export function toViewportPointerEvents(
  raw_points: RawPointerEvent[],
): PointerEvent[] {
  console.log("raw_points", raw_points);

  const start_time = raw_points[0].t;

  return raw_points.map((p) => [
    p.viewport_p.x,
    p.viewport_p.y,
    p.t - start_time,
    p.event_type,
  ]);
}
