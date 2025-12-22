import { showOverlay, hideOverlay } from "@/ui/overlay";
import type { ClientID, SessionID } from "@/types/contracts/primitives";
import { UserCancelledError } from "./error/UserCancelledError";
import { withInactivityTimeout } from "@/core/policy/withInactivityTimeout";
import { InactivityTimeoutError } from "./error/TimeoutError";
import { CaptchaProcess } from "./CaptchaProcess";

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
export class CaptchaController {
  private _in_flight: Promise<SessionID> | null = null;

  async getOrCreateCaptcha(client_id: ClientID): Promise<SessionID> {
    if (!client_id) {
      throw new Error("client_id is required");
    }

    return (this._in_flight ??= this.execute(client_id).finally(() => {
      this._in_flight = null;
    }));
  }

  private async execute(client_id: ClientID): Promise<SessionID> {
    try {
      const process = new CaptchaProcess();
      showOverlay();

      return await withInactivityTimeout({
        timeout_ms: INACTIVITY_TIMEOUT_MS,
        inactivity_timeout_task: () => process.run(client_id),
      });
    } catch (e: any) {
      console.log("e", e);
      if (e instanceof UserCancelledError) throw e;
      if (e instanceof InactivityTimeoutError) throw e;
      throw new Error("AUTH_FAILED");
    } finally {
      hideOverlay();
    }
  }
}
