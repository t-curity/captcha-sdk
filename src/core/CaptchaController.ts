import { createCaptchaClient } from "@/api/createCaptchaClient";
import { showOverlay, hideOverlay } from "@/ui/overlay";
import type {
  SessionID,
  CaptchaResponse,
  CaptchaPayload,
} from "@/api/captcha.types";
import { PhaseAResult } from "@/ui/contracts";
import { renderPhaseA } from "@/ui/phaseA";

class UserCancelledError extends Error {
  code = "USER_CANCELLED" as const;
  constructor() {
    super("USER_CANCELLED");
  }
}

function mapPhaseAToPayload(result: PhaseAResult): CaptchaPayload {
  if (result.cancelled) {
    throw new UserCancelledError();
  }

  return {
    phase: "PHASE_A",
    behavior_pattern_data: result.behavior_pattern_data,
  };
}

export class CaptchaController {
  private inFlight: Promise<SessionID> | null = null;

  async run(clientId: string): Promise<SessionID> {
    if (!clientId) {
      throw new Error("clientId is required");
    }

    // 🔒 단일 실행 보장
    if (this.inFlight) {
      return this.inFlight;
    }

    this.inFlight = this.execute(clientId).finally(() => {
      this.inFlight = null;
    });

    return this.inFlight;
  }

  private async execute(clientId: string): Promise<SessionID> {
    const client = createCaptchaClient();

    showOverlay();

    let cancelled = false;

    try {
      // 1️⃣ INIT
      let res: CaptchaResponse = await client.init(clientId);
      console.log(res);

      if (res.status !== "INIT") {
        throw new Error("INVALID_STATE");
      }

      const session_id = res.session_id;

      // 2️⃣ 서버 주도 상태 머신
      while (true) {
        if (cancelled) {
          throw new UserCancelledError();
        }

        console.log(res);

        switch (res.status) {
          case "INIT": {
            res = await client.request(session_id);
            continue;
          }
          case "PHASE_A": {
            const uiResult: PhaseAResult = await renderPhaseA(
              res.problem.image,
              res.problem.guide_line!,
            );

            const payload = mapPhaseAToPayload(uiResult);

            res = await client.submit(session_id, payload);
            continue;
          }
          case "PHASE_B": {
            const payload: CaptchaPayload = {
              phase: "PHASE_B",
              behavior_pattern_data: [],
              answer: [
                "n02088364_2158",
                "n02088364_2160",
                "n02105641_1945",
                "n02105641_4815",
              ],
            };

            res = await client.submit(session_id, payload);
            continue;
          }
          case "COMPLETED": {
            return session_id;
          }
          default:
            throw new Error("INVALID_STATE");
        }
      }
    } catch (e: any) {
      if (e?.code === "USER_CANCELLED") throw e;
      throw new Error("AUTH_FAILED");
    } finally {
      hideOverlay();
    }
  }
}
