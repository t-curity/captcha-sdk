import {
  RawPoint,
  RawPointerEvent,
} from "@/types/input-event/RawPointerEventModel";

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  raw_points: RawPointerEvent[],
  color: string,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.strokeStyle = color;

  let prev: RawPoint | null = null;

  for (const p of raw_points) {
    if (p.event_type !== "move" && p.event_type !== "move_out") {
      prev = null;
      continue;
    }

    if (prev) {
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.img_p.x, p.img_p.y);
      ctx.stroke();
    }

    prev = p.img_p;
  }
}
