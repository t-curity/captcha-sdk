import { GuideLine } from "@/types/contracts/problems";
import { THEME } from "@/ui/theme";
import { RawPointerEvent } from "@/ui/input/raw";
import { getEventCoords, toImageCoords } from "@/utils/coords";
import { drawStroke } from "@/ui/canvas/drawStroke";
import { STROKE_PRESET } from "@/ui/canvas/strokePresets";
import { StrokeManager } from "../../../utils/StrokeManager";
import {
  calculateProgress,
  isPointInsideGuideLine,
} from "@/utils/guideLineMath";

type PhaseAInputParams = {
  slot: HTMLElement;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  guide_line: GuideLine;
  onPass: (points: RawPointerEvent[]) => void;
  onFail: (reason: "OUT_OF_GUIDE" | "TOO_SHORT") => void;
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
  const manager = new StrokeManager();

  let activePointerId: number | null = null;

  let passTimeout: number | null = null;
  let failTimeout: number | null = null;

  const clearAllTimeouts = () => {
    if (passTimeout) clearTimeout(passTimeout);
    if (failTimeout) clearTimeout(failTimeout);
    passTimeout = failTimeout = null;
  };

  const onPointerDown = (e: PointerEvent) => {
    if (activePointerId !== null) return;
    e.preventDefault();

    clearAllTimeouts();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    activePointerId = e.pointerId;
    slot.setPointerCapture(e.pointerId);

    const { viewport_p, img_p } = getEventCoords(
      e,
      img.getBoundingClientRect(),
    );
    manager.start(viewport_p, img_p);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!manager.isPressed || e.pointerId !== activePointerId) return;
    e.preventDefault();

    const { viewport_p, img_p } = getEventCoords(
      e,
      img.getBoundingClientRect(),
    );
    const inside = isPointInsideGuideLine(
      img_p,
      img.getBoundingClientRect(),
      guide_line,
    );

    manager.move(viewport_p, img_p, inside ? "move" : "move_out");

    drawStroke(ctx, manager.getCurrentSegment(), STROKE_PRESET.normal);
  };

  const handleEnd = (e: PointerEvent, isCancelled: boolean) => {
    if (!manager.isPressed || activePointerId === null) return;

    const { viewport_p, img_p } = getEventCoords(
      e,
      img.getBoundingClientRect(),
    );
    const result = manager.stop(
      viewport_p,
      img_p,
      isCancelled ? "cancel" : "up",
    );

    if (result) {
      const isAlwaysInside =
        !isCancelled &&
        result.current.every((p) => p.event_type !== "move_out");

      const passed =
        isAlwaysInside &&
        calculateProgress(
          result.current,
          img.getBoundingClientRect(),
          guide_line,
        ) >= (guide_line.min_progress_threshold ?? 0.8);

      drawStroke(
        ctx,
        result.current,
        passed ? STROKE_PRESET.pass : STROKE_PRESET.fail,
      );

      if (passed) {
        passTimeout = window.setTimeout(
          () => onPass(result.current),
          THEME.duration.passDraw,
        );
      } else {
        const reason = !isAlwaysInside ? "OUT_OF_GUIDE" : "TOO_SHORT";

        onFail(reason);
        manager.clear();
        failTimeout = window.setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          failTimeout = null;
        }, THEME.duration.failDraw);
      }

      if (activePointerId !== null) {
        try {
          slot.releasePointerCapture(activePointerId);
        } catch {}
        activePointerId = null;
      }
    }
  };

  const onPointerUp = (e: PointerEvent) => handleEnd(e, false);
  const onLostPointerCapture = (e: PointerEvent) => handleEnd(e, true);
  const onPointerCancel = (e: PointerEvent) => handleEnd(e, true);
  const onDragStart = (e: DragEvent) => {
    e.preventDefault();
    return false;
  };

  slot.addEventListener("pointerdown", onPointerDown, { passive: false });
  slot.addEventListener("pointermove", onPointerMove, { passive: false });
  slot.addEventListener("dragstart", onDragStart, { passive: false });
  slot.addEventListener("lostpointercapture", onLostPointerCapture);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerCancel);

  return () => {
    clearAllTimeouts();
    slot.removeEventListener("pointerdown", onPointerDown);
    slot.removeEventListener("pointermove", onPointerMove);
    slot.removeEventListener("dragstart", onDragStart);
    slot.removeEventListener("lostpointercapture", onLostPointerCapture);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerCancel);
  };
}
