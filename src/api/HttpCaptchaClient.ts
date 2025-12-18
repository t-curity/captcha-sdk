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
    let res = await this.post(
      "/v1/session/init",
      {
        "X-Client-Id": client_id,
      },
      {},
    );

    return res;
  }

  async request(session_Id: SessionID): Promise<CaptchaResponse> {
    let res = await this.post(
      "/v1/captcha/request",
      {
        "X-Session-Id": session_Id,
      },
      {},
    );

    return res;
  }

  async submit(
    session_Id: SessionID,
    payload: CaptchaPayload,
  ): Promise<CaptchaResponse> {
    const res = await this.post(
      "/v1/captcha/submit",
      {
        "X-Session-Id": session_Id,
      },
      payload,
    );

    return res;
  }

  private async post(
    path: string,
    headers?: Record<string, string>,
    body?: unknown,
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
