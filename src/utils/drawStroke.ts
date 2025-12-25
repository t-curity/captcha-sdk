import { RawPoint, RawPointerEvent } from "@/ui/types/RawPointerEventModel";

type StrokeOptions = {
  color: string | "#000";
  lineWidth: number | 5;
  shadowColor: string | "#000";
  shadowBlur: number | 0;
};

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  raw_points: RawPointerEvent[],
  {
    color = "#000",
    lineWidth = 3,
    shadowColor = "transparent",
    shadowBlur = 0,
  }: Partial<StrokeOptions> = {},
) {
  if (raw_points.length < 2) return;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowColor = shadowColor;
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
