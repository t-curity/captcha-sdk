import { CaptchaController } from "@/core/CaptchaController";

declare global {
  interface Window {
    TCuritySDK?: {
      captcha: (clientId: string) => Promise<string>;
    };
  }
}

const controller = new CaptchaController();

async function captcha(clientId: string): Promise<string> {
  return controller.run(clientId);
}

window.TCuritySDK = {
  captcha,
};

export { captcha };
