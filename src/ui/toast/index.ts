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
  const { container, showToast } = createToastDOM();
  shell.mount(container);

  // Style
  shell.applyStyle(toastCss, "toast");

  toastInstance = {
    container,
    showToast,
    cleanup: () => {
      container.remove();
      shell.removeStyle("toast");
      toastInstance = null;
    },
  };

  return toastInstance;
}
