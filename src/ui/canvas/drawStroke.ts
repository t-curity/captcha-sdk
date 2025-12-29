import { THEME } from "@/ui/theme";
import { RawPointerEvent } from "@/ui/input/raw";
import { StrokeOptions } from "./types";

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  raw_points: RawPointerEvent[],
  options: StrokeOptions,
) {
  if (raw_points.length < 2) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.strokeStyle = options.color;
  ctx.lineWidth = options.lineWidth;
  ctx.shadowBlur = options.shadowBlur;
  ctx.shadowColor = options.shadowColor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();

  let isFirst = true;

  for (const p of raw_points) {
    if (p.event_type === "down") {
      ctx.moveTo(p.img_p.x, p.img_p.y);
      isFirst = false;
    } else if (p.event_type === "move" || p.event_type === "move_out") {
      if (isFirst) {
        ctx.moveTo(p.img_p.x, p.img_p.y);
        isFirst = false;
      } else {
        ctx.lineTo(p.img_p.x, p.img_p.y);
      }
    }
  }

  ctx.stroke();

  ctx.shadowBlur = 0;
}
