import type { ClientID, SessionID } from "@/types/contracts/primitives";
import { UserCancelledError } from "./error/UserCancelledError";
import { watchInactivity } from "@/core/policy/watchInactivity";
import { InactivityTimeoutError } from "./error/InactivityTimeoutError";
import { CaptchaProcess } from "./CaptchaProcess";
import { getOrCreateShell } from "@/ui/shell";

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
    const abort_controller = new AbortController();
    const { signal } = abort_controller;
    const process = new CaptchaProcess();
    const stopInactivityWatch = watchInactivity(
      abort_controller,
      INACTIVITY_TIMEOUT_MS,
    );
    const shell = getOrCreateShell({
      onAbort: (reason) => {
        if (reason === "TIMEOUT") {
          shell.root.dispatchEvent(new CustomEvent("phase:timeout"));
        } else {
          abort_controller.abort(new UserCancelledError());
        }
      },
    });
    const abort_watcher = new Promise<never>((_, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), {
        once: true,
      });
    });

    try {
      return await Promise.race([
        process.run(client_id, signal),
        abort_watcher,
      ]);
    } catch (e: any) {
      console.log("e", e);
      if (e instanceof UserCancelledError) throw e;
      if (e instanceof InactivityTimeoutError) throw e;
      throw new Error("AUTH_FAILED");
    } finally {
      stopInactivityWatch(); // 이벤트 리스너 제거
      shell.cleanup(); // 쉘 리소스 정리 (로딩, 타이머 등)
    }
  }
}
