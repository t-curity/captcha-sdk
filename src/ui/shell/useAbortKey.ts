import { AbortReason } from "@/types/contracts/phase-results";
import { THEME } from "../theme";

export function useAbortObservers(onAbort: (reason: AbortReason) => void) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onAbort("ESC");
    }
  };

  window.addEventListener("keydown", onKeyDown);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
  };
}
