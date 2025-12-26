import { AbortReason } from "@/types/contracts/phase-results";
import { THEME } from "../theme";

export function useAbortObservers(onAbort: (reason: AbortReason) => void) {
  let blurTimer: number | null = null;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onAbort("ESC");
    }
  };

  const onBlur = () => {
    blurTimer = window.setTimeout(() => {
      onAbort("CANCEL");
    }, THEME.duration.abortGrace);
  };

  const onFocus = () => {
    if (blurTimer) {
      clearTimeout(blurTimer);
      blurTimer = null;
    }
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("blur", onBlur);
  window.addEventListener("focus", onFocus);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("focus", onFocus);
    if (blurTimer) clearTimeout(blurTimer);
  };
}
