import { AbortReason } from "@/types/contracts/phase-results";
import { GuideLine } from "@/types/contracts/problems";
import { THEME } from "@/ui/theme";
import { RawPointerEvent } from "@/ui/input/raw";
import { toImageCoords } from "@/utils/coords";
import { drawStroke } from "@/ui/canvas/drawStroke";
import { isPointInsideGuideLine } from "@/utils/guideLineMath";
import { STROKE_PRESET } from "@/ui/canvas/strokePresets";

type PhaseAInputParams = {
  slot: HTMLElement;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  guide_line: GuideLine;
  onPass: (points: RawPointerEvent[]) => void;
  onFail: () => void;
};

export function usePhaseAInput({
  slot,
  img,
  canvas,
  ctx,
  guide_line,
  onPass,
  onFail,
}: PhaseAInputParams) {
  let raw_points: RawPointerEvent[] = [];
  let isPressed = false;
  let activePointerId: number | null = null;

  let passTimeout: number | null = null;
  let failTimeout: number | null = null;

  const clearAllTimeouts = () => {
    if (passTimeout) clearTimeout(passTimeout);
    if (failTimeout) clearTimeout(failTimeout);
    passTimeout = null;
    failTimeout = null;
  };

  const onPointerDown = (e: PointerEvent) => {
    if (activePointerId !== null) return;
    e.preventDefault();

    clearAllTimeouts();

    raw_points = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    activePointerId = e.pointerId;
    isPressed = true;
    slot.setPointerCapture(e.pointerId);

    const img_p = toImageCoords(e, img.getBoundingClientRect());

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
    e.preventDefault();

    const imgRect = img.getBoundingClientRect();
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

    drawStroke(ctx, raw_points, STROKE_PRESET.normal);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== activePointerId) return;
    e.preventDefault();

    const last = raw_points[raw_points.length - 1];

    raw_points.push({
      img_p: last?.img_p ?? { x: 0, y: 0 },
      viewport_p: last?.viewport_p ?? { x: 0, y: 0 },
      t: Date.now(),
      event_type: "up",
    });

    const passed = raw_points.every((p) => p.event_type !== "move_out");
    drawStroke(
      ctx,
      raw_points,
      passed ? STROKE_PRESET.pass : STROKE_PRESET.fail,
    );

    if (passed) {
      passTimeout = window.setTimeout(() => {
        onPass(raw_points.slice());
      }, THEME.duration.passDraw);
    } else {
      onFail();
      failTimeout = window.setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        failTimeout = null;
      }, THEME.duration.failDraw);
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

  const onLostPointerCapture = () => {
    cleanupDragOnly();
  };

  slot.addEventListener("pointerdown", onPointerDown, { passive: false });
  slot.addEventListener("pointermove", onPointerMove, { passive: false });
  slot.addEventListener("pointerup", onPointerUp);
  slot.addEventListener("pointercancel", onPointerCancel);
  slot.addEventListener("lostpointercapture", onLostPointerCapture);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerCancel);

  return () => {
    clearAllTimeouts();
    slot.removeEventListener("pointerdown", onPointerDown);
    slot.removeEventListener("pointermove", onPointerMove);
    slot.removeEventListener("pointerup", onPointerUp);
    slot.removeEventListener("pointercancel", onPointerCancel);
    slot.removeEventListener("lostpointercapture", onLostPointerCapture);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerCancel);
  };
}
