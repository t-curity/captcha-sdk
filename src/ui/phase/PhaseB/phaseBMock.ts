import { getOverlayRoot, onOverlayDismiss } from "@/ui/overlay/overlay";
import { applyShadowStyle } from "@/ui/shadow/applyStyle";
import { phaseBaseCss } from "@/ui/shell/phase-base.style";
import { createPhaseBaseDOM } from "@/ui/shell/phase-base.dom";
import { useAbortKey } from "@/ui/shell/useAbortKey";

import { phaseBCss } from "./phaseB.style";
import { createPhaseBDOM } from "./phaseB.dom";
import { usePhaseBInput } from "./usePhaseBInput";

import { MockImageLoader } from "@/mock/MockImageLoader";
import type {
  PhaseBResult,
  AbortReason,
} from "@/types/contracts/phase-results";

export function renderPhaseBMock(): Promise<PhaseBResult> {
  return new Promise((resolve) => {
    console.log("renderPhaseBMock");

    const overlay = getOverlayRoot();

    const { root, body, setPhasePercents } = createPhaseBaseDOM();
    overlay.appendChild(root);
    setPhasePercents([0, 100]);

    applyShadowStyle(overlay, phaseBaseCss, "phase-base");
    applyShadowStyle(overlay, phaseBCss, "phase-b");

    const { container, gridEl, slotEls } =
      createPhaseBDOM("동물만 순서대로 선택하세요");
    body.appendChild(container);

    const loader = new MockImageLoader();
    const images = loader.problemImages(); // 9개

    images.forEach((item, idx) => {
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
      maxSelect: 4,
      onPass: ({ selected, raw_points }) => {
        setTimeout(() => {
          finish({
            cancelled: false,
            user_answer: selected.map((index) => images[index].id),
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
