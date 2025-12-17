import { getOverlayRoot } from "@/ui/overlay";
import { GuideLine } from "@/api/captcha.types";
import { StrokePoint } from "@/stroke/StrokeModel";
import { PhaseAResult } from "@/ui/contracts";

const COLOR_DRAW = "#000";
const COLOR_PASS = "rgba(0,200,0,0.9)";
const COLOR_FAIL = "rgba(255,60,60,0.9)";

export function renderPhaseA(
  imageSrc: string,
  guideLine: GuideLine,
): Promise<PhaseAResult> {
  return new Promise((resolve) => {
    const root = getOverlayRoot();

    const container = document.createElement("div");
    container.innerHTML = `
      <style>
        .phase-a {
          background: #fff;
          padding: 16px;
          border-radius: 8px;
        }
      </style>
      <div class="phase-a"></div>
    `;
    root.appendChild(container);

    const slot = document.createElement("div");
    slot.style.position = "relative";
    slot.style.display = "inline-block";

    const img = document.createElement("img");
    img.src = imageSrc;
    img.style.display = "block";
    img.style.maxWidth = "480px";
    img.style.userSelect = "none";
    img.draggable = false;
    img.addEventListener("dragstart", (e) => e.preventDefault());

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";

    slot.appendChild(img);
    slot.appendChild(canvas);
    container.querySelector(".phase-a")!.appendChild(slot);

    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    img.onload = () => {
      const r = img.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;

      renderGuideLine(r);
    };

    function renderGuideLine(rect: DOMRect) {
      const { start, end, width } = guideLine;

      const ax = start[0] * rect.width;
      const ay = start[1] * rect.height;
      const bx = end[0] * rect.width;
      const by = end[1] * rect.height;

      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const bandWidth = rect.width * width;

      const band = document.createElement("div");
      band.style.position = "absolute";
      band.style.left = `${ax}px`;
      band.style.top = `${ay - bandWidth / 2}px`;
      band.style.width = `${len}px`;
      band.style.height = `${bandWidth}px`;
      band.style.border = "1px dashed red";
      band.style.pointerEvents = "none";
      band.style.transformOrigin = "0 50%";
      band.style.transform = `rotate(${angle}rad)`;

      const center = document.createElement("div");
      center.style.position = "absolute";
      center.style.left = `${ax}px`;
      center.style.top = `${ay}px`;
      center.style.width = `${len}px`;
      center.style.borderTop = "1px solid green";
      center.style.pointerEvents = "none";
      center.style.transformOrigin = "0 0";
      center.style.transform = `rotate(${angle}rad)`;

      slot.appendChild(band);
      slot.appendChild(center);
    }

    let stroke: StrokePoint[] = [];
    let isPressed = false;
    let activePointerId: number | null = null;

    function isInsideGuideLinePx(
      px: number,
      py: number,
      rect: DOMRect,
    ): boolean {
      const [sx, sy] = guideLine.start;
      const [ex, ey] = guideLine.end;

      const ax = sx * rect.width;
      const ay = sy * rect.height;
      const bx = ex * rect.width;
      const by = ey * rect.height;

      const abx = bx - ax;
      const aby = by - ay;
      const apx = px - ax;
      const apy = py - ay;

      const abLenSq = abx * abx + aby * aby;
      if (abLenSq === 0) return false;

      let t = (apx * abx + apy * aby) / abLenSq;
      t = Math.max(0, Math.min(1, t));

      const cx = ax + abx * t;
      const cy = ay + aby * t;

      const dx = px - cx;
      const dy = py - cy;

      const dist = Math.hypot(dx, dy);
      const halfWidthPx = (guideLine.width * rect.width) / 2;

      return dist <= halfWidthPx;
    }

    function drawStroke(color: string) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;

      let prev: { x: number; y: number } | null = null;
      const r = img.getBoundingClientRect();

      for (const p of stroke) {
        // 🔥 move_out도 그린다
        if (p.type !== "move" && p.type !== "move_out") {
          prev = null;
          continue;
        }

        const x = p.x * r.width;
        const y = p.y * r.height;

        if (prev) {
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        prev = { x, y };
      }
    }

    /* =========================
     * Pointer Events
     * ========================= */
    slot.addEventListener("pointerdown", (e) => {
      if (activePointerId !== null) return;

      stroke = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      activePointerId = e.pointerId;
      isPressed = true;
      slot.setPointerCapture(e.pointerId);

      const r = img.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;

      stroke.push({
        x: Math.min(Math.max(px / r.width, 0), 1),
        y: Math.min(Math.max(py / r.height, 0), 1),
        t: Date.now(),
        type: "down",
      });
    });

    slot.addEventListener("pointermove", (e) => {
      if (!isPressed || e.pointerId !== activePointerId) return;

      const r = img.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;

      const x = Math.min(Math.max(px / r.width, 0), 1);
      const y = Math.min(Math.max(py / r.height, 0), 1);

      const insideGuide = isInsideGuideLinePx(px, py, r);

      stroke.push({
        x,
        y,
        t: Date.now(),
        type: insideGuide ? "move" : "move_out",
      });

      // 🔥 항상 그린다
      drawStroke(COLOR_DRAW);
    });

    slot.addEventListener("pointerup", (e) => {
      if (e.pointerId !== activePointerId) return;

      // up 기록
      stroke.push({
        x: stroke[stroke.length - 1]?.x ?? 0,
        y: stroke[stroke.length - 1]?.y ?? 0,
        t: Date.now(),
        type: "up",
      });

      const passed = stroke.every((p) => p.type !== "move_out");

      // 결과 색으로 다시 그리기
      drawStroke(passed ? COLOR_PASS : COLOR_FAIL);

      if (passed) {
        // ✅ 통과: 1초 후 결과 전달 + 종료
        const resultStroke = stroke.slice();

        setTimeout(() => {
          cleanup();
          resolve({
            cancelled: false,
            stroke: resultStroke,
          } as any);
        }, 1000);
      } else {
        setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          stroke = [];
        }, 1000);
      }

      isPressed = false;
      activePointerId = null;
      slot.releasePointerCapture(e.pointerId);
    });

    slot.addEventListener("pointercancel", (e) => {
      if (e.pointerId !== activePointerId) return;

      isPressed = false;
      activePointerId = null;
      stroke = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      slot.releasePointerCapture(e.pointerId);

      cleanup();
      resolve({ cancelled: true, reason: "CANCEL" } as any);
    });

    /* =========================
     * ESC 취소
     * ========================= */
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cleanup();
        resolve({ cancelled: true, reason: "ESC" });
      }
    };
    window.addEventListener("keydown", onKeyDown);

    /* =========================
     * Cleanup
     * ========================= */
    function cleanup() {
      container.remove();
      window.removeEventListener("keydown", onKeyDown);
    }
  });
}
