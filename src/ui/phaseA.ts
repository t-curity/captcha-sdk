import { getOverlayRoot } from "@/ui/overlay";
import type { GuideLine, PhaseAProblem } from "@/types/contracts/problems";
import { RawPointerEvent } from "@/types/input-event/RawPointerEventModel";
import { AbortReason, PhaseAResult } from "@/types/contracts/phase-results";
import { isPointInsideGuideLine, toRawLine } from "@/utils/guideLineMath";
import { toImageCoords } from "@/utils/coords";
import { drawStroke } from "@/utils/drawStroke";

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

    const { container, slot } = createPhaseADOM(guide_text);
    root.appendChild(container);

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

    img.onload = () => {
      const imgRect = getImgRect();
      canvas.width = imgRect.width;
      canvas.height = imgRect.height;
      canvas.style.width = `${imgRect.width}px`;
      canvas.style.height = `${imgRect.height}px`;

      // renderGuideLine(imgRect);
    };

    function renderGuideLine(rect: DOMRect) {
      const { start, end } = toRawLine(rect, guide_line);

      const dx = end.x - start.x;
      const dy = end.y - start.y;

      const len = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const bandWidth = rect.width * guide_line.width;

      const band = document.createElement("div");
      band.style.position = "absolute";
      band.style.left = `${start.x}px`;
      band.style.top = `${start.y - bandWidth / 2}px`;
      band.style.width = `${len}px`;
      band.style.height = `${bandWidth}px`;
      band.style.border = "1px dashed red";
      band.style.pointerEvents = "none";
      band.style.transformOrigin = "0 50%";
      band.style.transform = `rotate(${angle}rad)`;

      const center = document.createElement("div");
      center.style.position = "absolute";
      center.style.left = `${start.x}px`;
      center.style.top = `${start.y}px`;
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

    slot.addEventListener("pointerdown", (e) => {
      if (activePointerId !== null) return;

      raw_points = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      activePointerId = e.pointerId;
      isPressed = true;
      slot.setPointerCapture(e.pointerId);

      const imgRect = getImgRect();
      const img_p = toImageCoords(e, imgRect);

      raw_points.push({
        img_p,
        viewport_p: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        },
        t: Date.now(),
        event_type: "down",
      });
    });

    slot.addEventListener("pointermove", (e) => {
      if (!isPressed || e.pointerId !== activePointerId) return;

      const imgRect = getImgRect();
      const img_p = toImageCoords(e, imgRect);

      const insideGuide = isPointInsideGuideLine(img_p, imgRect, guide_line);

      raw_points.push({
        img_p,
        viewport_p: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        },
        t: Date.now(),
        event_type: insideGuide ? "move" : "move_out",
      });

      drawStroke(ctx, raw_points, COLOR_DRAW);
    });

    slot.addEventListener("pointerup", (e) => {
      if (e.pointerId !== activePointerId) return;

      const last = raw_points[raw_points.length - 1];

      raw_points.push({
        img_p: last?.img_p ?? { x: 0, y: 0 },
        viewport_p: last?.viewport_p ?? { x: 0, y: 0 },
        t: Date.now(),
        event_type: "up",
      });

      const passed = raw_points.every((p) => p.event_type !== "move_out");

      drawStroke(ctx, raw_points, passed ? COLOR_PASS : COLOR_FAIL);

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

    const onResize = () => {
      syncCanvasSize();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    function syncCanvasSize() {
      const rect = getImgRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }

    window.addEventListener("resize", onResize);

    function getImgRect(): DOMRect {
      return img.getBoundingClientRect();
    }

    function cleanup() {
      container.remove();
      window.removeEventListener("keydown", onKeyDown);
    }
  });

  function createPhaseADOM(guide_text: string) {
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

    const slot = container.querySelector(".slot") as HTMLDivElement;
    return { container, slot };
  }
}
