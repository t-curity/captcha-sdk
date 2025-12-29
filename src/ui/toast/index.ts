import type { PhaseBResult } from "@/types/contracts/phase-results";
import { PhaseBProblem } from "@/types/contracts/problems";
import { phaseBaseShell } from "@/ui/shell";
import { createToastDOM } from "./toast.dom";
import { toastCss } from "./toast.style";

export interface Toast {
  container: HTMLElement;
  showToast: (message: string) => void;
  cleanup: () => void;
}

let toastInstance: Toast | null = null;

export function getOrCreateToast(shell: phaseBaseShell): Toast {
  if (toastInstance) return toastInstance;

  // Dom
  const { container } = createToastDOM();
  shell.mountToast(container);

  // Style
  shell.applyStyle(toastCss, "toast");

  let timeoutId: number | null = null;

  const showToast = (message: string, duration = 3000) => {
    container.classList.remove("show");

    requestAnimationFrame(() => {
      window.setTimeout(() => {
        requestAnimationFrame(() => {
          container.textContent = message;
          container.classList.add("show");
        });
      });
    });

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = window.setTimeout(() => {
      container.classList.remove("show");
      timeoutId = null;
    }, duration);
  };

  toastInstance = {
    container,
    showToast,
    cleanup: () => {
      console.log("cleanupToast");
      container.remove();
      shell.unmountToast();
      shell.removeStyle("toast");
      toastInstance = null;
    },
  };

  return toastInstance;
}
