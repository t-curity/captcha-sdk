import { CaptchaController } from "@/core/CaptchaController";
import type { ClientID, SessionID } from "./types/contracts/primitives";

declare global {
  interface Window {
    TCuritySDK?: {
      captcha: (clientId: ClientID) => Promise<SessionID>;
    };
  }
}

const controller = new CaptchaController();

async function captcha(clientId: ClientID): Promise<SessionID> {
  return controller.run(clientId);
}

window.TCuritySDK = {
  captcha,
};

export { captcha };
