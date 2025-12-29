export type CaptchaMode = "local" | "dev" | "prod";

const ALLOWED_MODES: CaptchaMode[] = ["local", "dev", "prod"];

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

function normalizeMode(mode: unknown): CaptchaMode {
  if (ALLOWED_MODES.includes(mode as CaptchaMode)) {
    return mode as CaptchaMode;
  }
  return "prod";
}

function normalizeBaseUrl(baseUrl: unknown): string {
  if (typeof baseUrl !== "string") return "";

  // 상대 경로 허용 (/api)
  if (baseUrl.startsWith("/")) return baseUrl;

  try {
    const url = new URL(baseUrl);
    return url.origin;
  } catch {
    return "https://tcurity.cloud";
  }
}

export function getEnv() {
  const raw = window.__TCURITY__ ?? {};

  return {
    mode: normalizeMode(raw.mode),
    baseUrl: normalizeBaseUrl(raw.baseUrl),
    timeoutMs: typeof raw.timeoutMs === "number" ? raw.timeoutMs : 15_000,
  };
}
