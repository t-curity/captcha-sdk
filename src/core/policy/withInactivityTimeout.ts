import { InactivityTimeoutError } from "@/core/error/InactivityTimeoutError";

export type InactivityTimeoutOptions<T> = {
  timeout_ms: number;
  inactivity_timeout_task: () => Promise<T>;
};

export async function withInactivityTimeout<T>(
  options: InactivityTimeoutOptions<T>,
): Promise<T> {
  let timer: number | null = null;

  const events = ["mousemove", "mousedown", "keydown", "touchstart"];

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const resetTimer = (reject: (reason?: any) => void) => {
    if (!Number.isFinite(options.timeout_ms) || options.timeout_ms <= 0) {
      throw new Error("timeout_ms must be a positive number");
    }

    clearTimer();
    timer = window.setTimeout(() => {
      reject(new InactivityTimeoutError());
    }, options.timeout_ms);
  };

  let inactivityPromiseCleanup: () => void = () => {};

  const inactivityPromise = new Promise<never>((_, reject) => {
    const onActivity = () => resetTimer(reject);

    events.forEach((e) => window.addEventListener(e, onActivity, true));

    resetTimer(reject);

    // cleanup hook
    inactivityPromiseCleanup = () => {
      events.forEach((e) => window.removeEventListener(e, onActivity, true));
      clearTimer();
    };
  });

  try {
    return await Promise.race([
      Promise.resolve().then(options.inactivity_timeout_task),
      inactivityPromise,
    ]);
  } finally {
    inactivityPromiseCleanup();
  }
}
