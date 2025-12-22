import { createCaptchaClient } from "@/createCaptchaClient";
import { showOverlay, hideOverlay } from "@/ui/overlay";
import type { SessionID } from "@/types/contracts/primitives";
import type {
  CaptchaPayload,
  InitResponse,
  SubmitResponse,
} from "@/types/contracts/protocol";
import type { PhaseAProblem } from "@/types/contracts/problems";
import { PhaseAResult } from "@/types/contracts/phase-results";
import { renderPhaseA } from "@/ui/phaseA";
import { createDeviceMetadata } from "@/utils/device-metadata";
import { mapPhaseAToPayload } from "@/mappers/phaseA.mapper";
import { UserCancelledError } from "./error/UserCancelledError";

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

    try {
      // Init
      const init_response: InitResponse = await client.init(clientId);

      if (!init_response.success) {
        throw new Error(init_response.error ?? "INIT_FAILED");
      }

      if (init_response.status !== "INIT") {
        throw new Error("INVALID_STATE");
      }

      const session_id = init_response.data.session_id;

      // Request
      let request_response = await client.request(session_id);

      if (!request_response.success) {
        throw new Error(request_response.error ?? "REQUEST_FAILED");
      }

      // PHASE_A setting
      let res: SubmitResponse = request_response;

      // 문제 풀이 시작
      while (true) {
        if (!res.success) {
          throw new Error(res.error ?? "REQUEST_FAILED");
        }

        console.log(res);

        switch (res.status) {
          case "PHASE_A": {
            const { problem } = res.data;
            const result: PhaseAResult = await renderPhaseA(problem);

            if (result.cancelled) {
              throw new UserCancelledError();
            }

            const payload = mapPhaseAToPayload(result.raw_points);

            console.log("PHASE_A", payload);

            res = await client.submit(session_id, payload);
            continue;
          }
          case "PHASE_B": {
            const { problem } = res.data;
            // PHASE_B UI render
            const payload: CaptchaPayload = {
              points: [],
              user_answer: [
                "n02088364_2158",
                "n02088364_2160",
                "n02105641_1945",
                "n02105641_4815",
              ],
              metadata: createDeviceMetadata(),
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
      console.log("e", e);
      if (e?.code === "USER_CANCELLED") throw e;
      throw new Error("AUTH_FAILED");
    } finally {
      hideOverlay();
    }
  }
}
