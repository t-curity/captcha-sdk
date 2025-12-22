import { CaptchaController } from "@/core/CaptchaController";
import type { ClientID, SessionID } from "./types/contracts/primitives";

declare global {
  interface Window {
    TCuritySDK?: {
      captcha: (client_id: ClientID) => Promise<SessionID>;
    };
  }
}

const controller = new CaptchaController();

async function captcha(client_id: ClientID): Promise<SessionID> {
  return controller.getOrCreateCaptcha(client_id);
}

window.TCuritySDK = {
  captcha,
};

export { captcha };
