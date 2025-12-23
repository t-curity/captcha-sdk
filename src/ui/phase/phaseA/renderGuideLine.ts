import { GuideLine } from "@/types/contracts/problems";
import { toRawLine } from "@/utils/guideLineMath";

export function renderGuideLine(
  slot: HTMLElement,
  rect: DOMRect,
  guide_line: GuideLine,
) {
  console.log("guide_line", guide_line);
  const { start, end } = toRawLine(rect, guide_line);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const bandWidth = rect.width * guide_line.width;

  const band = document.createElement("div");
  band.className = "tc-guide-band";
  band.style.left = `${start.x}px`;
  band.style.top = `${start.y - bandWidth / 2}px`;
  band.style.width = `${len}px`;
  band.style.height = `${bandWidth}px`;
  band.style.transform = `rotate(${angle}rad)`;

  const center = document.createElement("div");
  center.className = "tc-guide-center";
  center.style.left = `${start.x}px`;
  center.style.top = `${start.y}px`;
  center.style.width = `${len}px`;
  center.style.transform = `rotate(${angle}rad)`;

  slot.appendChild(band);
  slot.appendChild(center);

  return () => {
    band.remove();
    center.remove();
  };
}
