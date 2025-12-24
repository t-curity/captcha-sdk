const listeners = new Set<(reason: "NAVIGATE") => void>();

export function onOverlayDismiss(cb: (reason: "NAVIGATE") => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function emitOverlayDismiss(reason: "NAVIGATE") {
  for (const cb of listeners) cb(reason);
}
