import { InactivityTimeoutError } from "../error/InactivityTimeoutError";
import { INACTIVITY_TIMEOUT_MS } from "./limits";

export function watchInactivity(
  controller: AbortController,
  timeout_ms: number = INACTIVITY_TIMEOUT_MS,
): () => void {
  let timer: number | null = null;
  const events = ["mousemove", "mousedown", "keydown", "touchstart"];

  const resetTimer = () => {
    clearTimer();
    timer = window.setTimeout(() => {
      controller.abort(new InactivityTimeoutError());
    }, timeout_ms);
  };

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
  };

  const onActivity = () => resetTimer();
  events.forEach((e) => window.addEventListener(e, onActivity, true));
  resetTimer();

  return () => {
    events.forEach((e) => window.removeEventListener(e, onActivity, true));
    clearTimer();
  };
}
