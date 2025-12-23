import { getOverlayRoot, onOverlayDismiss } from "@/ui/overlay/overlay";
import type { PhaseAProblem } from "@/types/contracts/problems";
import { AbortReason, PhaseAResult } from "@/types/contracts/phase-results";
import { applyShadowStyle } from "@/ui/shadow/applyStyle";
import { phaseACss } from "./phaseA.style";
import { phaseBaseCss } from "@/ui/shell/phase-base.style";
import { createPhaseADOM } from "./phaseA.dom";
import { setupImageCanvas } from "@/ui/utils/setupImageCanvas";
import { renderGuideLine } from "./renderGuideLine";
import { usePhaseAInput } from "./usePhaseAInput";
import { useAbortKey } from "@/ui/shell/useAbortKey";
import { createPhaseBaseDOM } from "@/ui/shell/phase-base.dom";

export function renderPhaseA(
  { guide_line, guide_text, image, phase, time_limit }: PhaseAProblem,
  PhaseAOptions: { debugGuideLine?: boolean } = {},
): Promise<PhaseAResult> {
  return new Promise((resolve) => {
    // Root
    const overlayRoot = getOverlayRoot();

    // BaseRoot
    const {
      root: baseRoot,
      body,
      closeBtn,
      setPhasePercents,
    } = createPhaseBaseDOM();

    overlayRoot.appendChild(baseRoot);

    // Dom
    const { container, slot } = createPhaseADOM(guide_text);
    body.appendChild(container);

    // 진행도 세팅
    setPhasePercents([100, 0]);

    // Style
    applyShadowStyle(overlayRoot, phaseBaseCss, "phase-base");
    applyShadowStyle(overlayRoot, phaseACss, "phase-a");

    // 이미지
    const {
      img,
      canvas,
      ctx,
      onReady,
      getImageLocalRect,
      cleanup: cleanupCanvas,
    } = setupImageCanvas(slot, image);

    // Debug용 GuideLine
    let cleanupGuide: (() => void) | null = null;

    if (PhaseAOptions?.debugGuideLine) {
      onReady(() => {
        const rect = getImageLocalRect();
        console.log("img natural", img.naturalWidth, img.naturalHeight);
        console.log("img rect", img.getBoundingClientRect());
        cleanupGuide = renderGuideLine(slot, rect, guide_line);
      });
    }

    const cleanupInput = usePhaseAInput({
      slot,
      img,
      canvas,
      ctx,
      guide_line,
      onPass: (points) => {
        setTimeout(() => {
          cleanup();
          resolve({ cancelled: false, raw_points: points });
        }, 1000);
      },
      onFail: () => {
        setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 1000);
      },
      onAbort: abort,
    });
    const cleanupKey = useAbortKey(abort);

    // Close
    let finished = false;

    function finish(result: PhaseAResult) {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(result);
    }

    function abort(reason: AbortReason) {
      finish({ cancelled: true, reason });
    }

    const offDismiss = onOverlayDismiss(() => abort("NAVIGATE"));

    // Clean up
    function cleanup() {
      offDismiss();
      cleanupGuide?.();
      cleanupInput();
      cleanupKey();
      cleanupCanvas();
      baseRoot.remove();
    }
  });
}
