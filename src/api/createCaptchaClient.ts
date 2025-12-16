import { CaptchaClient } from "./CaptchaClient";
import { MockCaptchaClient } from "./MockCaptchaClient";
import { HttpCaptchaClient } from "./HttpCaptchaClient";
import { getEnv } from "../config/captcha.env";

export function createCaptchaClient(): CaptchaClient {
  const env = getEnv();
  console.log(env);
  switch (env.mode) {
    case "dev":
      return new MockCaptchaClient();
    case "local":
    case "prod":
      return new HttpCaptchaClient(env);
    default:
      throw new Error("INVALID_CLIENT_MODE");
  }
}
