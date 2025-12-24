import { renderLoading } from "./renderLoading";

export async function withLoading<T>(
  task: () => Promise<T>,
  minDurationMs = 0,
): Promise<T> {
  const hide = renderLoading();
  const start = performance.now();

  try {
    const result = await task();
    const elapsed = performance.now() - start;

    if (elapsed < minDurationMs) {
      await new Promise((r) => setTimeout(r, minDurationMs - elapsed));
    }

    return result;
  } finally {
    hide();
  }
}
