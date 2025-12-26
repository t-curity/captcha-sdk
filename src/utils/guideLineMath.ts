import { NormalizedLine } from "@/types/contracts/primitives";
import { GuideLine } from "@/types/contracts/problems";
import { RawLine, RawPoint } from "@/ui/input/raw";

export function toRawLine(rect: DOMRect, line: NormalizedLine): RawLine {
  const [sx, sy] = line.start;
  const [ex, ey] = line.end;

  return {
    start: { x: sx * rect.width, y: sy * rect.height },
    end: { x: ex * rect.width, y: ey * rect.height },
  };
}

export function isPointInsideGuideLine(
  p: RawPoint,
  rect: DOMRect,
  guide_line: GuideLine,
): boolean {
  const { start, end } = toRawLine(rect, guide_line);

  const abx = end.x - start.x;
  const aby = end.y - start.y;
  const apx = p.x - start.x;
  const apy = p.y - start.y;

  const abLenSq = abx * abx + aby * aby;
  if (abLenSq === 0) return false;

  let t = (apx * abx + apy * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));

  const cx = start.x + abx * t;
  const cy = start.y + aby * t;

  const dx = p.x - cx;
  const dy = p.y - cy;

  const dist = Math.hypot(dx, dy);
  const halfWidthPx = (guide_line.width * rect.width) / 2;

  return dist <= halfWidthPx;
}
