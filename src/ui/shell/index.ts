import { applyShadowStyle, removeShadowStyle } from "../shadow/applyStyle";
import { createPhaseBaseDOM } from "./phase-base.dom";
import { AbortReason } from "@/types/contracts/phase-results";
import { phaseBaseCss } from "./phase-base.style";
import { useAbortObservers } from "./useAbortKey";
import { hideOverlay, showOverlay, onOverlayDismiss } from "../overlay";
import { Problem } from "@/types/contracts/problems";

const CRITICAL_THRESHOLD = 0.8;

export interface phaseBaseShell {
  root: HTMLElement;
  body: HTMLElement;
  mount: (content: HTMLElement) => void;
  mountLoading: (el: HTMLElement) => void;
  unmountLoading: () => void;
  mountToast: (el: HTMLElement) => void;
  unmountToast: () => void;
  showLoading: () => void;
  hideLoading: () => void;
  applyStyle: (css: string, id: string) => void;
  removeStyle: (id: string) => void;
  setup: (problem: Problem) => void;
  startTimer: () => void;
  resetTimer: () => void;
  stopTimer: () => void;
  withLoading: <T>(task: () => Promise<T>, minMs: number) => Promise<T>;
  cleanup: () => void;
}

interface ShellOptions {
  onAbort: (reason: AbortReason) => void;
}

let shellInstance: phaseBaseShell | null = null;

export function getOrCreateShell(options?: ShellOptions): phaseBaseShell {
  if (shellInstance) return shellInstance;

  if (!options) throw new Error("options is required");

  const { stage, shadow } = showOverlay();
  const { onAbort } = options;

  // Root
  const root = document.createElement("div");
  root.className = "tc-shell-root";
  stage.appendChild(root);

  // Style
  applyShadowStyle(shadow, phaseBaseCss, "phase-base");

  // 부품
  let loadingEl: HTMLElement | null = null;
  let toastEl: HTMLElement | null = null;
  let body: HTMLElement;
  let setPhasePercents: (percents: number[]) => void;

  let timerId: number | null = null;
  let startTime: number = 0;

  let duration = 0;
  let totalSteps = 0;
  let currentActiveStep = 0;

  const cleanupObservers = useAbortObservers(onAbort);
  const offDismiss = onOverlayDismiss(() => onAbort("NAVIGATE"));

  const updateProgress = () => {
    if (!startTime || !setPhasePercents) return;

    const elapsed = Date.now() - startTime;
    const progressRatio = elapsed / duration;
    const progress = Math.min((elapsed / duration) * 100, 100);

    if (progressRatio >= CRITICAL_THRESHOLD) {
      root.classList.add("is-critical");
    } else {
      root.classList.remove("is-critical");
    }

    const percents = Array.from({ length: totalSteps }).map((_, i) => {
      const stepNum = i + 1;
      if (stepNum < currentActiveStep) return 100;
      if (stepNum === currentActiveStep) return progress;
      return 0;
    });

    setPhasePercents(percents);

    if (progress < 100) {
      timerId = requestAnimationFrame(updateProgress);
    } else {
      root.classList.remove("is-critical");
      onAbort("TIMEOUT");
    }
  };

  // 인스턴스 객체 생성
  shellInstance = {
    root,
    get body() {
      return body;
    },
    mount: (content: HTMLElement) => {
      if (!body) return;
      body.innerHTML = "";
      body.appendChild(content);
    },
    mountLoading: (el: HTMLElement) => {
      console.log("mountLoading", el);
      if (loadingEl) loadingEl.remove();
      loadingEl = el;
      loadingEl.style.display = "none";
      root.appendChild(loadingEl);
    },

    unmountLoading: () => {
      if (loadingEl) {
        loadingEl.remove();
        loadingEl = null;
      }
    },

    mountToast: (el: HTMLElement) => {
      console.log("mountToast", el);
      if (toastEl) toastEl.remove();
      toastEl = el;
      root.appendChild(toastEl);
    },
    unmountToast: () => {
      console.log("unmountToast", toastEl);
      if (toastEl) {
        toastEl.remove();
        toastEl = null;
      }
    },
    showLoading: () => {
      if (loadingEl) loadingEl.style.display = "flex";
    },
    hideLoading: () => {
      if (loadingEl) loadingEl.style.display = "none";
    },
    applyStyle: (css: string, id: string) => {
      applyShadowStyle(shadow, css, id);
    },
    removeStyle: (id: string) => {
      removeShadowStyle(shadow, id);
    },
    setup: (problem) => {
      const [current_phase, total_phases] = problem.phase
        .split("/")
        .map(Number);
      currentActiveStep = current_phase;
      totalSteps = total_phases;
      duration = problem.time_limit * 1000;
      startTime = 0;

      const dom = createPhaseBaseDOM(total_phases);
      root.innerHTML = "";
      if (loadingEl) root.appendChild(loadingEl);
      if (toastEl) root.appendChild(toastEl);
      root.appendChild(dom.root);

      body = dom.body;
      setPhasePercents = dom.setPhasePercents;
      dom.closeBtn.onclick = () => onAbort("CANCEL");

      console.log(`[Shell] Lazy DOM Initialized for ${problem.phase}`);
    },
    startTimer: () => {
      if (timerId) cancelAnimationFrame(timerId);
      if (startTime === 0) startTime = Date.now();
      timerId = requestAnimationFrame(updateProgress);
    },
    resetTimer: () => {
      startTime = Date.now();
      root.classList.remove("is-critical");

      if (!timerId) {
        timerId = requestAnimationFrame(updateProgress);
      }
    },
    stopTimer: () => {
      if (timerId) {
        cancelAnimationFrame(timerId);
        timerId = null;
      }
    },
    withLoading: async (task, minMs: number = 300) => {
      shellInstance!.showLoading();

      const start = performance.now();

      try {
        return await task();
      } finally {
        const elapsed = performance.now() - start;
        if (elapsed < minMs)
          await new Promise((r) => setTimeout(r, minMs - elapsed));
        shellInstance!.hideLoading();
      }
    },
    cleanup: () => {
      loadingEl?.remove();
      shellInstance?.stopTimer();
      shellInstance?.removeStyle("phase-base");
      cleanupObservers();
      offDismiss();
      root.remove();
      hideOverlay();
      shellInstance = null;
    },
  };

  return shellInstance;
}
