import { CaptchaController } from "@/core/CaptchaController";
import type { ClientID, SessionID } from "./types/contracts/primitives";
import { UserCancelledError } from "./core/error/UserCancelledError";
import { InactivityTimeoutError } from "./core/error/TimeoutError";

declare global {
  interface Window {
    TCuritySDK?: {
      captcha: (client_id: ClientID) => Promise<SessionID>;
      errors: {
        InactivityTimeoutError: typeof InactivityTimeoutError;
        UserCancelledError: typeof UserCancelledError;
      };
    };
  }
}

const controller = new CaptchaController();

async function captcha(client_id: ClientID): Promise<SessionID> {
  return controller.getOrCreateCaptcha(client_id);
}

window.TCuritySDK = {
  captcha,
  errors: {
    InactivityTimeoutError,
    UserCancelledError,
  },
};

export { captcha };
