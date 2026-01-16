import type { PhaseAProblem } from "@/types/contracts/problems";
import { PhaseAResult } from "@/types/contracts/phase-results";
import { phaseACss } from "./phaseA.style";
import { createPhaseADOM } from "./phaseA.dom";
import { setupImageCanvas } from "@/ui/utils/setupImageCanvas";
import { renderGuideLine } from "./renderGuideLine";
import { usePhaseAInput } from "./usePhaseAInput";
import { phaseBaseShell } from "@/ui/shell";
import { getOrCreateToast } from "@/ui/toast";
import { getOverlayStage } from "@/ui/overlay/overlay.dom";

export function renderPhaseA(
  { guide_line, guide_text, image, phase, time_limit }: PhaseAProblem,
  shell: phaseBaseShell,
  PhaseAOptions: { debugGuideLine?: boolean } = {},
): Promise<{ result: PhaseAResult; asyncAnim: () => Promise<void> }> {
  return new Promise((resolve) => {
    // Dom
    const { container, slot, dragHandle } = createPhaseADOM(guide_text);
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

    // 드래그 핸들 위치 설정
    const positionDragHandle = () => {
      const rect = getImageLocalRect();
      const [startX, startY] = guide_line.start;
      
      dragHandle.style.left = `${startX * rect.width}px`;
      dragHandle.style.top = `${startY * rect.height}px`;
    };

    onReady(positionDragHandle);

    const playSplitAnimation = async () => {
      const rect = img.getBoundingClientRect();
      const stage = getOverlayStage();

      // 애니메이션 시작 전 핸들 숨기기
      dragHandle.style.display = 'none';

      const leftHalf = img.cloneNode() as HTMLImageElement;
      const rightHalf = img.cloneNode() as HTMLImageElement;

      const setupShard = (shard: HTMLImageElement, isLeft: boolean) => {
        shard.className = `tc-split-half ${isLeft ? "tc-split-left" : "tc-split-right"}`;

        Object.assign(shard.style, {
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          margin: "0",
        });

        stage.appendChild(shard);
      };

      setupShard(leftHalf, true);
      setupShard(rightHalf, false);

      const splitPos = guide_line.start[0];
      const splitPercent = `${guide_line.start[0] * 100}%`;

      const leftSpeed = 60 * (1 + (1 - splitPos));
      const rightSpeed = 60 * (1 + splitPos);
      const leftAngle = 8 * (1 + (1 - splitPos));
      const rightAngle = 8 * (1 + splitPos);

      stage.style.setProperty("--split-pos", splitPercent);
      stage.style.setProperty("--left-speed", leftSpeed.toString());
      stage.style.setProperty("--right-speed", rightSpeed.toString());
      stage.style.setProperty("--left-angle", leftAngle.toString());
      stage.style.setProperty("--right-angle", rightAngle.toString());

      img.style.visibility = "hidden";
      canvas.style.opacity = "0";

      // 강제 리플로우
      void leftHalf.offsetHeight;
      void rightHalf.offsetHeight;

      // Double rAF
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          stage.classList.add("is-splitting");
        });
      });

      setTimeout(() => {
        leftHalf.remove();
        rightHalf.remove();
        stage.classList.remove("is-splitting");
      }, 700);
    };

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
      dragHandle,
      onPass: (points) => {
        shell.stopTimer();
        finish({ cancelled: false, raw_points: points });
      },
      onFail: (reason) => {
        console.log(reason);
        // 실패 시 핸들 원위치
        positionDragHandle();
        dragHandle.classList.remove('dragging');
        
        switch (reason) {
          case "OUT_OF_GUIDE":
            toast.showToast("영역을 벗어났습니다.");
            break;
          case "TOO_SHORT":
            toast.showToast("끝까지 그어주세요.");
            break;
        }
      },
    });

    // Close
    let finished = false;

    function finish(result: PhaseAResult) {
      if (finished) return;
      finished = true;

      cleanupInput();
      cleanupGuide?.();
      cleanupCanvas();

      shell.stopTimer();
      shell.root.removeEventListener("phase:timeout", onTimeout);

      console.log("finish", result);

      resolve({ result, asyncAnim: playSplitAnimation });
    }
  });
}
