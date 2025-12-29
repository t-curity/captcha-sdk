import type { PhaseAProblem } from "@/types/contracts/problems";
import { PhaseAResult } from "@/types/contracts/phase-results";
import { phaseACss } from "./phaseA.style";
import { createPhaseADOM } from "./phaseA.dom";
import { setupImageCanvas } from "@/ui/utils/setupImageCanvas";
import { renderGuideLine } from "./renderGuideLine";
import { usePhaseAInput } from "./usePhaseAInput";
import { phaseBaseShell } from "@/ui/shell";
import { getOrCreateToast } from "@/ui/toast";

export function renderPhaseA(
  { guide_line, guide_text, image, phase, time_limit }: PhaseAProblem,
  shell: phaseBaseShell,
  PhaseAOptions: { debugGuideLine?: boolean } = {},
): Promise<PhaseAResult> {
  return new Promise((resolve) => {
    // Dom
    const { container, slot } = createPhaseADOM(guide_text);
    shell.mount(container);

    // Style
    shell.applyStyle(phaseACss, "phase-a");

    const toast = getOrCreateToast(shell);

    // 이미지
    const {
      img,
      canvas,
      ctx,
      onReady,
      getImageLocalRect,
      cleanup: cleanupCanvas,
    } = setupImageCanvas(slot, image);

    const onTimeout = () => finish({ cancelled: true, reason: "TIMEOUT" });

    shell.root.addEventListener("phase:timeout", onTimeout, { once: true });

    // Debug용 GuideLine
    let cleanupGuide: (() => void) | null = null;

    if (PhaseAOptions?.debugGuideLine) {
      onReady(() => {
        cleanupGuide = renderGuideLine(slot, getImageLocalRect(), guide_line);
      });
    }

    // Clean
    const cleanupInput = usePhaseAInput({
      slot,
      img,
      canvas,
      ctx,
      guide_line,
      onPass: (points) => {
        shell.stopTimer();
        finish({ cancelled: false, raw_points: points });
      },
      onFail: (reason) => {
        console.log(reason);
        switch (reason) {
          case "OUT_OF_GUIDE":
            toast.showToast("영역을 벗어났습니다.");
            break;
          case "TOO_SHORT":
            toast.showToast("끝까지 그어주세요.");
            break;
        }
        //shell.resetTimer();
      },
    });

    // Close
    let finished = false;

    function finish(result: PhaseAResult) {
      if (finished) return;
      finished = true;

      cleanupInput();
      //cleanupGuide?.();
      //cleanupCanvas();

      shell.stopTimer();
      shell.root.removeEventListener("phase:timeout", onTimeout);

      console.log("finish", result);
      resolve(result);
    }
  });
}
