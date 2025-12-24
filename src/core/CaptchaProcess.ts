import { CaptchaClient } from "@/api/CaptchaClient";
import { createCaptchaClient } from "@/createCaptchaClient";
import { ClientID, SessionID } from "@/types/contracts/primitives";
import {
  InitResponse,
  PhaseAResponse,
  PhaseBResponse,
  SubmitResponse,
} from "@/types/contracts/protocol";
import { PhaseAResult } from "@/types/contracts/phase-results";
import { renderPhaseA } from "@/ui/phase/phaseA/phaseA";
import { UserCancelledError } from "./error/UserCancelledError";
import { mapPhaseAToPayload as mapToBehavioralData } from "@/mappers/phaseA.mapper";
import { renderPhaseB } from "@/ui/phase/PhaseB/phaseB";
import { withLoading } from "@/ui/loading/withLoading";

export class CaptchaProcess {
  private _client: CaptchaClient | null = null;

  private getOrCreateClient(): CaptchaClient {
    return (this._client ??= createCaptchaClient());
  }

  async run(client_id: ClientID): Promise<SessionID> {
    let session_id = await this.init(client_id);

    let res: SubmitResponse = await this.request(session_id);

    return await this.captchaFlowLoop(session_id, res);
  }

  private async init(client_id: ClientID): Promise<SessionID> {
    const client = this.getOrCreateClient();
    const init_response = await withLoading(() => client.init(client_id), 0);

    if (!init_response.success) {
      throw new Error(init_response.error ?? "INIT_FAILED");
    }

    if (init_response.status !== "INIT") {
      throw new Error("INVALID_STATE");
    }

    return init_response.data.session_id;
  }

  private async request(session_id: SessionID): Promise<SubmitResponse> {
    const client = this.getOrCreateClient();
    let request_response = await withLoading(
      () => client.request(session_id),
      100,
    );
    if (!request_response.success) {
      throw new Error(request_response.error ?? "REQUEST_FAILED");
    }

    return request_response;
  }

  private async captchaFlowLoop(
    session_id: SessionID,
    initial: SubmitResponse,
  ): Promise<SessionID> {
    let current = initial;
    console.log("initial", initial);

    while (current.success) {
      switch (current.status) {
        case "PHASE_A":
          current = await this.handlePhaseA(session_id, current);
          //   current = {
          //     data: {
          //       problem: createMockPhaseBProblem(),
          //     },
          //     status: "PHASE_B",
          //     success: true,
          //   };
          break;
        case "PHASE_B":
          current = await this.handlePhaseB(session_id, current);
          break;
        case "COMPLETED": {
          return session_id;
        }
        default:
          throw new Error("INVALID_STATE");
      }
      console.log("current", current);
    }

    throw new Error(current.error ?? "REQUEST_FAILED");
  }

  private async handlePhaseA(
    session_id: SessionID,
    current: PhaseAResponse,
  ): Promise<SubmitResponse> {
    const client = this.getOrCreateClient();
    const { problem } = current.data;
    const result = await renderPhaseA(problem, {
      debugGuideLine: true,
    });

    if (result.cancelled) {
      switch (result.reason) {
        case "ESC":
        case "CLOSE":
        case "CANCEL":
          throw new UserCancelledError();
        default:
          throw new Error("AUTH_FAILED");
      }
    }

    const payload = mapToBehavioralData(result.raw_points);

    console.log("PHASE_A", payload);

    return await withLoading(() => client.submit(session_id, payload), 400);
  }

  private async handlePhaseB(
    session_id: SessionID,
    current: PhaseBResponse,
  ): Promise<SubmitResponse> {
    console.log("handlePhaseB", current);
    const client = this.getOrCreateClient();
    const { problem } = current.data;
    const result = await renderPhaseB(problem, {
      debugGuideLine: true,
    });
    console.log("result", result);

    if (result.cancelled) {
      switch (result.reason) {
        case "ESC":
        case "CLOSE":
        case "CANCEL":
          throw new UserCancelledError();
        default:
          throw new Error("AUTH_FAILED");
      }
    }

    const payload = {
      ...mapToBehavioralData(result.raw_points),
      user_answer: result.user_answer,
    };

    console.log("PHASE_B", payload);

    return await withLoading(() => client.submit(session_id, payload), 400);
  }
}
