import { CaptchaClient } from "./api/CaptchaClient";
import { MockCaptchaClient } from "./api/MockCaptchaClient";
import { HttpCaptchaClient } from "./api/HttpCaptchaClient";
import { getEnv } from "./config/captcha.env";

export function createCaptchaClient(): CaptchaClient {
  const env = getEnv();
  console.log("env", env);
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
