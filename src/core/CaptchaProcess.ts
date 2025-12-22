import { CaptchaClient } from "@/api/CaptchaClient";
import { createCaptchaClient } from "@/createCaptchaClient";
import { ClientID, SessionID } from "@/types/contracts/primitives";
import {
  CaptchaPayload,
  InitResponse,
  PhaseAResponse,
  PhaseBResponse,
  SubmitResponse,
} from "@/types/contracts/protocol";
import { PhaseAResult } from "@/types/contracts/phase-results";
import { renderPhaseA } from "@/ui/phaseA";
import { UserCancelledError } from "./error/UserCancelledError";
import { mapPhaseAToPayload } from "@/mappers/phaseA.mapper";
import { createDeviceMetadata } from "@/utils/device-metadata";

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
    const init_response: InitResponse = await client.init(client_id);

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
    let request_response = await client.request(session_id);

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

    while (current.success) {
      console.log("current", current);

      switch (current.status) {
        case "PHASE_A":
          current = await this.handlePhaseA(session_id, current);
          console.log("current", current);
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
    }

    throw new Error(current.error ?? "REQUEST_FAILED");
  }

  private async handlePhaseA(
    session_id: SessionID,
    current: PhaseAResponse,
  ): Promise<SubmitResponse> {
    const client = this.getOrCreateClient();
    const { problem } = current.data;

    const result: PhaseAResult = await renderPhaseA(problem);

    if (result.cancelled) {
      throw new UserCancelledError();
    }

    const payload = mapPhaseAToPayload(result.raw_points);

    console.log("PHASE_A", payload);

    return await client.submit(session_id, payload);
  }

  private async handlePhaseB(
    session_id: SessionID,
    current: PhaseBResponse,
  ): Promise<SubmitResponse> {
    const client = this.getOrCreateClient();
    const { problem } = current.data;
    console.log("problem", problem);

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

    console.log("PHASE_B", payload);

    return await client.submit(session_id, payload);
  }
}
