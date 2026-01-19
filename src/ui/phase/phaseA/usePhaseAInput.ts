import { GuideLine } from "@/types/contracts/problems";
import { THEME } from "@/ui/theme";
import { RawPointerEvent } from "@/ui/input/raw";
import { getEventCoords } from "@/utils/coords";
import { drawStroke } from "@/ui/canvas/drawStroke";
import { STROKE_PRESET } from "@/ui/canvas/strokePresets";
import { StrokeManager } from "../../../utils/StrokeManager";
import {
  calculateProgress,
  isPointInsideGuideLine,
} from "@/utils/guideLineMath";
import { 
  MIN_PROGRESS_THRESHOLD,
  MAX_OUT_RATIO_PC,
  MAX_OUT_RATIO_MOBILE,
} from "./phaseA.constants";
import { DeviceType } from "@/types/contracts/protocol";

type PhaseAInputParams = {
  slot: HTMLElement;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  guide_line: GuideLine;
  dragHandle: HTMLElement;
  deviceType: DeviceType;
  onPass: (points: RawPointerEvent[]) => void;
  onFail: (reason: "OUT_OF_GUIDE" | "TOO_SHORT") => void;
};

export function usePhaseAInput({
  slot,
  img,
  canvas,
  ctx,
  guide_line,
  dragHandle,
  deviceType,
  onPass,
  onFail,
}: PhaseAInputParams) {
  const controller = new AbortController();
  const { signal } = controller;

  const manager = new StrokeManager();

  let activePointerId: number | null = null;

  let passTimeout: number | null = null;
  let failTimeout: number | null = null;

  const clearAllTimeouts = () => {
    if (passTimeout) clearTimeout(passTimeout);
    if (failTimeout) clearTimeout(failTimeout);
    passTimeout = failTimeout = null;
  };

  // 드래그 핸들 위치 업데이트
  const updateHandlePosition = (clientX: number, clientY: number) => {
    const slotRect = slot.getBoundingClientRect();
    const x = clientX - slotRect.left;
    const y = clientY - slotRect.top;
    
    dragHandle.style.left = `${x}px`;
    dragHandle.style.top = `${y}px`;
  };

  const onPointerDown = (e: PointerEvent) => {
    if (activePointerId !== null) return;

    e.preventDefault();

    clearAllTimeouts();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    manager.clear();

    dragHandle.classList.add('dragging');
    updateHandlePosition(e.clientX, e.clientY);

    beginPointerTracking(e);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerId !== activePointerId || !manager.isPressed) return;

    e.preventDefault();

    updatePointerTracking(e);
    updateHandlePosition(e.clientX, e.clientY);

    drawStroke(ctx, manager.getCurrentSegment(), STROKE_PRESET.normal);
  };

  const handleEnd = (e: PointerEvent, isCancelled: boolean) => {
    if (e.pointerId !== activePointerId) return;

    endPointerTracking(e, isCancelled);

    const result = inboundVerify();

    if (result) {
      drawStroke(
        ctx,
        result.currentSegment,
        result.passed ? STROKE_PRESET.pass : STROKE_PRESET.fail,
      );

      if (result.passed) {
        // 성공 시 핸들 숨기기
        dragHandle.style.display = 'none';
        passTimeout = window.setTimeout(
          () => onPass(result.currentSegment),
          THEME.duration.passDraw,
        );
      } else {
        dragHandle.classList.remove('dragging');
        onFail(result.reason);
        failTimeout = window.setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          failTimeout = null;
        }, THEME.duration.failDraw);
      }
    } else {
      dragHandle.classList.remove('dragging');
    }
  };

  function beginPointerTracking(e: PointerEvent) {
    const { viewport_p, img_p } = getEventCoords(
      e,
      img.getBoundingClientRect(),
    );

    manager.start(viewport_p, img_p);
    slot.setPointerCapture(e.pointerId);
    activePointerId = e.pointerId;

    console.assert(manager.isPressed === true);
  }

  function updatePointerTracking(e: PointerEvent) {
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

    console.assert(manager.isPressed === true);
  }

  function endPointerTracking(e: PointerEvent, isCancelled: boolean) {
    const { viewport_p, img_p } = getEventCoords(
      e,
      img.getBoundingClientRect(),
    );

    manager.stop(viewport_p, img_p, isCancelled ? "cancel" : "up");

    if (activePointerId != null) {
      try {
        slot.releasePointerCapture(activePointerId);
      } catch {}
    }

    activePointerId = null;

    console.assert(manager.isPressed === false);
  }

  function inboundVerify():
    | {
        passed: true;
        isAcceptable: boolean;
        currentSegment: RawPointerEvent[];
      }
    | {
        passed: false;
        currentSegment: RawPointerEvent[];
        reason: "OUT_OF_GUIDE" | "TOO_SHORT";
      }
    | null {
    const currentSegment = manager.getCurrentSegment();

    if (currentSegment.length < 2) return null;

    // 디바이스별 이탈 허용 비율 적용
    const maxOutRatio = deviceType === "PC" ? MAX_OUT_RATIO_PC : MAX_OUT_RATIO_MOBILE;
    const outCount = currentSegment.filter(p => p.event_type === "move_out").length;
    const outRatio = outCount / currentSegment.length;
    const isAcceptable = outRatio <= maxOutRatio;

    const passed =
      isAcceptable &&
      calculateProgress(
        currentSegment,
        img.getBoundingClientRect(),
        guide_line,
      ) >= (guide_line.min_progress_threshold ?? MIN_PROGRESS_THRESHOLD);

    if (passed) {
      return { passed, isAcceptable, currentSegment };
    } else {
      const reason = !isAcceptable ? "OUT_OF_GUIDE" : "TOO_SHORT";

      return { passed, reason, currentSegment };
    }
  }

  const onPointerUp = (e: PointerEvent) => handleEnd(e, false);
  const onLostPointerCapture = (e: PointerEvent) => handleEnd(e, true);
  const onPointerCancel = (e: PointerEvent) => handleEnd(e, true);
  const onDragStart = (e: DragEvent) => {
    e.preventDefault();
    return false;
  };

  slot.addEventListener("pointerdown", onPointerDown, {
    signal,
    passive: false,
  });
  slot.addEventListener("pointermove", onPointerMove, {
    signal,
    passive: false,
  });
  slot.addEventListener("dragstart", onDragStart, {
    signal,
    passive: false,
  });
  slot.addEventListener("lostpointercapture", onLostPointerCapture, {
    signal,
  });
  window.addEventListener("pointerup", onPointerUp, {
    signal,
  });
  window.addEventListener("pointercancel", onPointerCancel, {
    signal,
  });

  return () => {
    endPointerTracking(new PointerEvent("cancel"), true);
    clearAllTimeouts();
    controller.abort();
    manager.clear();
  };
}
