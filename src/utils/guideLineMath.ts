import { NormalizedLine } from "@/types/contracts/primitives";
import { GuideLine } from "@/types/contracts/problems";
import { RawLine, RawPoint, RawPointerEvent } from "@/ui/input/raw";

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

export function calculateProgress(
  raw_points: RawPointerEvent[],
  rect: DOMRect,
  guide_line: GuideLine,
): number {
  if (raw_points.length < 2) return 0;

  const { start, end } = toRawLine(rect, guide_line);

  // 가이드라인 벡터 및 길이 제곱 계산
  const ab = { x: end.x - start.x, y: end.y - start.y };
  const ab2 = ab.x * ab.x + ab.y * ab.y;

  // 1. 투영값(t) 계산
  const validTs = raw_points.map((p) => {
    const ap = { x: p.img_p.x - start.x, y: p.img_p.y - start.y };
    // 벡터 투영 공식: t = (AP · AB) / |AB|²
    return (ap.x * ab.x + ap.y * ab.y) / ab2;
  });

  if (validTs.length === 0) return 0;

  // 2. 가이드라인 범위(0~1) 내로 제한하여 진척도 산출
  const minT = Math.max(0, Math.min(...validTs));
  const maxT = Math.min(1, Math.max(...validTs));

  console.log("calculateProgress: ", maxT, minT);
  // 최종 "높이(진척도)" 반환
  return maxT - minT;
}
