import { phaseBCss } from "./phaseB.style";
import { createPhaseBDOM } from "./phaseB.dom";
import { usePhaseBInput } from "./usePhaseBInput";

import type { PhaseBResult } from "@/types/contracts/phase-results";
import { PhaseBProblem } from "@/types/contracts/problems";
import { phaseBaseShell } from "@/ui/shell";

const MAX_ANSWER = 4;

export function renderPhaseB(
  { question, grid, phase, time_limit }: PhaseBProblem,
  shell: phaseBaseShell,
  PhaseAOptions: { debugGuideLine?: boolean } = {},
): Promise<PhaseBResult> {
  return new Promise((resolve) => {
    console.log("renderPhaseB");

    // Dom
    const { container, gridEl, slotEls } = createPhaseBDOM(
      question,
      grid,
      MAX_ANSWER,
    );
    shell.mount(container);

    // Style
    shell.applyStyle(phaseBCss, "phase-b");

    const onTimeout = () => finish({ cancelled: true, reason: "TIMEOUT" });

    shell.root.addEventListener("phase:timeout", onTimeout, { once: true });

    // Clean
    const cleanupInput = usePhaseBInput({
      gridEl,
      slotEls,
      max_answer: MAX_ANSWER,
      onPass: ({ selected, raw_points }) => {
        setTimeout(() => {
          finish({
            cancelled: false,
            selecteds: selected,
            raw_points,
          });
        }, 200);
      },
    });

    // Close
    let finished = false;

    function finish(result: PhaseBResult) {
      if (finished) return;
      finished = true;

      cleanupInput();

      shell.stopTimer();
      shell.root.removeEventListener("phase:timeout", onTimeout);

      console.log("finish", result);
      resolve(result);
    }
  });
}
