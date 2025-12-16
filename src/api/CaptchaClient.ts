import type { CaptchaPayload, CaptchaResponse } from "./captcha.types";

export interface CaptchaClient {
  init(client_id: string): Promise<CaptchaResponse>;
  request(sessionId: string): Promise<CaptchaResponse>;
  submit(sessionId: string, payload: CaptchaPayload): Promise<CaptchaResponse>;
}
