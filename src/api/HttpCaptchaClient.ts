import { CaptchaClient } from "./CaptchaClient";
import {
  CaptchaPayload,
  InitResponse,
  RequestResponse,
  ApiResponse,
  SubmitResponse,
} from "@/types/contracts/protocol";
import { ClientID, SessionID } from "@/types/contracts/primitives";
import { CaptchaEnv } from "../config/captcha.env";

export class HttpCaptchaClient implements CaptchaClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(env: CaptchaEnv) {
    this.baseUrl = env.baseUrl.replace(/\/$/, "");
    this.timeoutMs = env.timeoutMs;
  }

  async init(client_id: ClientID): Promise<InitResponse> {
    let res = await this.post<InitResponse>(
      "/v1/session/init",
      {
        "X-Client-Id": client_id,
      },
      {},
    );

    return res;
  }

  async request(session_Id: SessionID): Promise<RequestResponse> {
    let res = await this.post<RequestResponse>(
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
  ): Promise<SubmitResponse> {
    const res = await this.post<SubmitResponse>(
      "/v1/captcha/submit",
      {
        "X-Session-Id": session_Id,
      },
      payload,
    );

    return res;
  }

  private async post<T extends ApiResponse>(
    path: string,
    headers?: Record<string, string>,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!res.ok) {
      throw new Error("HTTP_ERROR");
    }

    return res.json();
  }
}
