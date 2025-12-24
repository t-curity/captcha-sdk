import { AbortReason } from "@/types/contracts/phase-results";
import { GuideLine } from "@/types/contracts/problems";
import { RawPointerEvent } from "@/ui/types/RawPointerEventModel";
import { toImageCoords } from "@/utils/coords";
import { drawStroke } from "@/utils/drawStroke";
import { isPointInsideGuideLine } from "@/utils/guideLineMath";

const COLOR_DRAW = "#000";
const COLOR_PASS = "rgba(0,200,0,0.9)";
const COLOR_FAIL = "rgba(255,60,60,0.9)";

type PhaseAInputParams = {
  slot: HTMLElement;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  guide_line: GuideLine;
  onPass: (points: RawPointerEvent[]) => void;
  onFail: () => void;
  onAbort: (reason: AbortReason) => void;
};

export function usePhaseAInput({
  slot,
  img,
  canvas,
  ctx,
  guide_line,
  onPass,
  onFail,
  onAbort,
}: PhaseAInputParams) {
  let raw_points: RawPointerEvent[] = [];
  let isPressed = false;
  let activePointerId: number | null = null;

  const getImgRect = () => img.getBoundingClientRect();

  const onPointerDown = (e: PointerEvent) => {
    if (activePointerId !== null) return;

    raw_points = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    activePointerId = e.pointerId;
    isPressed = true;
    slot.setPointerCapture(e.pointerId);

    const img_p = toImageCoords(e, getImgRect());

    raw_points.push({
      img_p,
      viewport_p: {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      },
      t: Date.now(),
      event_type: "down",
    });
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isPressed || e.pointerId !== activePointerId) return;

    const imgRect = getImgRect();
    const img_p = toImageCoords(e, imgRect);

    const inside = isPointInsideGuideLine(img_p, imgRect, guide_line);

    raw_points.push({
      img_p,
      viewport_p: {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      },
      t: Date.now(),
      event_type: inside ? "move" : "move_out",
    });

    drawStroke(ctx, raw_points, COLOR_DRAW);
  };

  const onPointerUp = (e: PointerEvent) => {
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
      onPass(raw_points.slice());
    } else {
      onFail();
    }

    cleanupDragOnly();
  };

  const onPointerCancel = (e: PointerEvent) => {
    if (e.pointerId !== activePointerId) return;

    cleanupDragOnly();
  };

  function cleanupDragOnly() {
    isPressed = false;

    if (activePointerId != null) {
      try {
        slot.releasePointerCapture(activePointerId);
      } catch {}
    }

    activePointerId = null;
  }

  slot.addEventListener("pointerdown", onPointerDown);
  slot.addEventListener("pointermove", onPointerMove);
  slot.addEventListener("pointerup", onPointerUp);
  slot.addEventListener("pointercancel", onPointerCancel);

  return () => {
    slot.removeEventListener("pointerdown", onPointerDown);
    slot.removeEventListener("pointermove", onPointerMove);
    slot.removeEventListener("pointerup", onPointerUp);
    slot.removeEventListener("pointercancel", onPointerCancel);
  };
}
