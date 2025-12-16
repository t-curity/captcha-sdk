export type CaptchaMode = "dev" | "local" | "prod";

export type CaptchaEnv = {
  mode: CaptchaMode;
  baseUrl: string;
  timeoutMs: number;
};

declare global {
  interface Window {
    __TCURITY__?: Partial<CaptchaEnv>;
  }
}

export function getEnv(): CaptchaEnv {
  if (window.__TCURITY__?.baseUrl) {
    return {
      mode: window.__TCURITY__.mode ?? "prod",
      baseUrl: window.__TCURITY__.baseUrl,
      timeoutMs: window.__TCURITY__.timeoutMs ?? 15_000,
    };
  }

  if (import.meta.env?.VITE_TCURITY_BASE_URL) {
    return {
      mode: (import.meta.env.VITE_TCURITY_MODE as CaptchaMode) ?? "prod",
      baseUrl: import.meta.env.VITE_TCURITY_BASE_URL,
      timeoutMs: Number(import.meta.env.VITE_TCURITY_TIMEOUT_MS) || 15_000,
    };
  }

  return {
    mode: "prod",
    baseUrl: "https://api.tcurity.io",
    timeoutMs: 15_000,
  };
}
