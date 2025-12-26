import { InactivityTimeoutError } from "../error/InactivityTimeoutError";

// withInactivityTimeout.ts
export function watchInactivity(
  controller: AbortController,
  timeout_ms: number,
): () => void {
  let timer: number | null = null;
  const events = ["mousemove", "mousedown", "keydown", "touchstart"];

  const resetTimer = () => {
    clearTimer();
    timer = window.setTimeout(() => {
      // 🌟 활동이 없으면 컨트롤러에 에러와 함께 신호를 보냅니다.
      controller.abort(new InactivityTimeoutError());
    }, timeout_ms);
  };

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
  };

  const onActivity = () => resetTimer();
  events.forEach((e) => window.addEventListener(e, onActivity, true));
  resetTimer();

  // Cleanup 함수 반환
  return () => {
    events.forEach((e) => window.removeEventListener(e, onActivity, true));
    clearTimer();
  };
}
