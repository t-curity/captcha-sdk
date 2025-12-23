import { AbortReason } from "@/types/contracts/phase-results";

export function useAbortKey(onAbort: (reason: AbortReason) => void) {
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
