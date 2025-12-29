import { AbortReason } from "@/types/contracts/phase-results";

const listeners = new Set<(reason: AbortReason) => void>();

export function onOverlayDismiss(cb: (reason: AbortReason) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function emitOverlayDismiss(reason: AbortReason) {
  for (const cb of listeners) cb(reason);
}
