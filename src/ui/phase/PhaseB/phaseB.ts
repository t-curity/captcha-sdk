import { getOverlayRoot, onOverlayDismiss } from "@/ui/overlay/overlay";
import { applyShadowStyle } from "@/ui/shadow/applyStyle";
import { phaseBaseCss } from "@/ui/shell/phase-base.style";
import { createPhaseBaseDOM } from "@/ui/shell/phase-base.dom";
import { useAbortKey } from "@/ui/shell/useAbortKey";

import { phaseBCss } from "./phaseB.style";
import { createPhaseBDOM } from "./phaseB.dom";
import { usePhaseBInput } from "./usePhaseBInput";

import type {
  PhaseBResult,
  AbortReason,
} from "@/types/contracts/phase-results";
import { PhaseBProblem } from "@/types/contracts/problems";
import { Answer } from "@/types/contracts/protocol";

export function renderPhaseB(
  { question, grid, phase, time_limit }: PhaseBProblem,
  PhaseAOptions: { debugGuideLine?: boolean } = {},
): Promise<PhaseBResult> {
  return new Promise((resolve) => {
    console.log("renderPhaseBMock");

    const maxSelect = 4;

    const overlay = getOverlayRoot();

    const { root, body, setPhasePercents } = createPhaseBaseDOM();
    overlay.appendChild(root);
    setPhasePercents([100, 0]);

    applyShadowStyle(overlay, phaseBaseCss, "phase-base");
    applyShadowStyle(overlay, phaseBCss, "phase-b");

    const { container, gridEl, slotEls } = createPhaseBDOM(question, maxSelect);
    body.appendChild(container);

    grid.forEach((item, idx) => {
      const cell = document.createElement("div");
      cell.className = "tc-cell";
      cell.dataset.index = String(idx);

      const img = document.createElement("img");
      img.src = item.image.startsWith("data:")
        ? item.image
        : `data:image/jpeg;base64,${item.image}`;

      img.draggable = false;
      img.addEventListener("dragstart", (ev) => ev.preventDefault());

      cell.appendChild(img);
      gridEl.appendChild(cell);
    });

    let finished = false;
    function finish(result: PhaseBResult) {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(result);
    }

    function abort(reason: AbortReason) {
      finish({ cancelled: true, reason });
    }

    const cleanupInput = usePhaseBInput({
      gridEl,
      slotEls,
      maxSelect,
      onPass: ({ selected, raw_points }) => {
        setTimeout(() => {
          finish({
            cancelled: false,
            user_answer: selected.map(
              (index) => grid[index].image_id,
            ) as Answer,
            raw_points,
          });
        }, 200);
      },
      onAbort: abort,
    });

    const cleanupKey = useAbortKey(abort);
    const offDismiss = onOverlayDismiss(() => abort("NAVIGATE"));

    function cleanup() {
      cleanupInput();
      cleanupKey();
      offDismiss();
      container.remove();
      root.remove();
    }
  });
}
