import { CaptchaClient } from "./CaptchaClient";
import { CaptchaResponse, CaptchaPayload, SessionID } from "./captcha.types";
import { CaptchaEnv } from "../config/captcha.env";

export class HttpCaptchaClient implements CaptchaClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(env: CaptchaEnv) {
    this.baseUrl = env.baseUrl.replace(/\/$/, "");
    this.timeoutMs = env.timeoutMs;
  }

  async init(client_id: string): Promise<CaptchaResponse> {
    return this.post(
      "/v1/session/init",
      {},
      {
        "X-Client-Id": client_id,
      },
    );
  }

  async request(session_Id: SessionID): Promise<CaptchaResponse> {
    return this.post(
      "/v1/captcha/request",
      {},
      {
        "X-Session-Id": session_Id,
      },
    );
  }

  async submit(
    session_Id: SessionID,
    payload: CaptchaPayload,
  ): Promise<CaptchaResponse> {
    return this.post("/v1/captcha/submit", payload, {
      "X-Session-Id": session_Id,
    });
  }

  private async post(
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<CaptchaResponse> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw new Error("HTTP_ERROR");
    }

    return res.json();
  }
}
