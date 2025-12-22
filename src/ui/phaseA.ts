import { getOverlayRoot } from "@/ui/overlay";
import type { GuideLine, PhaseAProblem } from "@/types/contracts/problems";
import { RawPointerEvent } from "@/types/input-event/RawPointerEventModel";
import { AbortReason, PhaseAResult } from "@/types/contracts/phase-results";

const COLOR_DRAW = "#000";
const COLOR_PASS = "rgba(0,200,0,0.9)";
const COLOR_FAIL = "rgba(255,60,60,0.9)";

export function renderPhaseA({
  guide_line,
  guide_text,
  image,
  phase,
  time_limit,
}: PhaseAProblem): Promise<PhaseAResult> {
  return new Promise((resolve) => {
    console.log("guide_line", guide_line);
    const root = getOverlayRoot();

    const container = document.createElement("div");
    container.innerHTML = `
      <style>
        .phase-a {
          background: #fff;
          padding: 16px;
          border-radius: 8px;
          // padding-top: 36px;
        }
        .slot {
          position: relative;
          display: inline-block;
        }
        .phase {
          width: 100%;
          margin-bottom: 12px;
        }
        .phase-bars {
          display: flex;
          gap: 6px;
          width: 100%;
        }
        .phase-bar {
          flex: 1;
          height: 6px;
          background: #e0e0e0; /* 회색 */
          border-radius: 3px;
        }
        .phase-bar.active {
          background: #1976d2; /* 파랑 */
        }
        .guide_text {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 8px;
        }
      </style>
      <div class="phase-a">
        <div class="phase">
          <div class="phase-bars">
            <div class="phase-bar active"></div>
            <div class="phase-bar"></div>
          </div></div>
        <div class="slot"></div>
        <div class="guide_text">${guide_text}</div>
      </div>
    `;

    // const closeBtn = document.createElement("button");
    // closeBtn.textContent = "×";
    // closeBtn.style.position = "absolute";
    // closeBtn.style.top = "8px";
    // closeBtn.style.right = "8px";
    // closeBtn.style.border = "none";
    // closeBtn.style.background = "transparent";
    // closeBtn.style.fontSize = "20px";
    // closeBtn.style.cursor = "pointer";
    // closeBtn.style.lineHeight = "1";
    // container.style.position = "relative";
    // container.appendChild(closeBtn);

    root.appendChild(container);

    const slot = container.querySelector(".phase-a .slot") as HTMLDivElement;

    const img = document.createElement("img");
    img.src = `data:image/png;base64,${image}`;
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

    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    let imgRect: DOMRect;

    img.onload = () => {
      imgRect = img.getBoundingClientRect();

      canvas.width = imgRect.width;
      canvas.height = imgRect.height;
      canvas.style.width = `${imgRect.width}px`;
      canvas.style.height = `${imgRect.height}px`;

      // renderGuideLine(imgRect);
    };

    function renderGuideLine(rect: DOMRect) {
      const { start, end, width } = guide_line;

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

    let raw_points: RawPointerEvent[] = [];
    let isPressed = false;
    let activePointerId: number | null = null;

    function isInsideGuideLinePx(
      px: number,
      py: number,
      rect: DOMRect,
    ): boolean {
      const [sx, sy] = guide_line.start;
      const [ex, ey] = guide_line.end;

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
      const halfWidthPx = (guide_line.width * rect.width) / 2;

      return dist <= halfWidthPx;
    }

    function drawStroke(color: string) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;

      let prev: { x: number; y: number } | null = null;

      for (const p of raw_points) {
        if (p.event_type !== "move" && p.event_type !== "move_out") {
          prev = null;
          continue;
        }

        if (prev) {
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.img_x, p.img_y);
          ctx.stroke();
        }

        prev = { x: p.img_x, y: p.img_y };
      }
    }

    slot.addEventListener("pointerdown", (e) => {
      if (activePointerId !== null) return;

      raw_points = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      activePointerId = e.pointerId;
      isPressed = true;
      slot.setPointerCapture(e.pointerId);

      const img_x = e.clientX - imgRect.left;
      const img_y = e.clientY - imgRect.top;

      raw_points.push({
        img_x,
        img_y,
        viewport_x: e.clientX / window.innerWidth,
        viewport_y: e.clientY / window.innerHeight,
        t: Date.now(),
        event_type: "down",
      });
    });

    slot.addEventListener("pointermove", (e) => {
      if (!isPressed || e.pointerId !== activePointerId) return;

      const img_x = e.clientX - imgRect.left;
      const img_y = e.clientY - imgRect.top;

      const insideGuide = isInsideGuideLinePx(img_x, img_y, imgRect);

      raw_points.push({
        img_x,
        img_y,
        viewport_x: e.clientX / window.innerWidth,
        viewport_y: e.clientY / window.innerHeight,
        t: Date.now(),
        event_type: insideGuide ? "move" : "move_out",
      });

      drawStroke(COLOR_DRAW);
    });

    slot.addEventListener("pointerup", (e) => {
      if (e.pointerId !== activePointerId) return;

      const last = raw_points[raw_points.length - 1];

      raw_points.push({
        img_x: last?.img_x ?? 0,
        img_y: last?.img_y ?? 0,
        viewport_x: last?.viewport_x ?? 0,
        viewport_y: last?.viewport_y ?? 0,
        t: Date.now(),
        event_type: "up",
      });

      const passed = raw_points.every((p) => p.event_type !== "move_out");

      drawStroke(passed ? COLOR_PASS : COLOR_FAIL);

      if (passed) {
        const result_raw_points = raw_points.slice();

        setTimeout(() => {
          cleanup();
          resolve({
            cancelled: false,
            raw_points: result_raw_points,
          });
        }, 1000);
      } else {
        setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          raw_points = [];
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
      raw_points = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      slot.releasePointerCapture(e.pointerId);

      abort("CANCEL");
    });

    // closeBtn.addEventListener("click", () => {
    //   abort("CLOSE");
    // });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        abort("ESC");
      }
    };
    window.addEventListener("keydown", onKeyDown);

    function abort(reason: AbortReason) {
      cleanup();
      resolve({ cancelled: true, reason });
    }

    function cleanup() {
      container.remove();
      window.removeEventListener("keydown", onKeyDown);
    }
  });
}
