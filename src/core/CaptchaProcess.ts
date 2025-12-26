import { CaptchaClient } from "@/api/CaptchaClient";
import { createCaptchaClient } from "@/createCaptchaClient";
import { ClientID, SessionID } from "@/types/contracts/primitives";
import {
  PhaseAResponse,
  PhaseBResponse,
  SubmitResponse,
} from "@/types/contracts/protocol";
import { renderPhaseA } from "@/ui/phase/phaseA";
import { UserCancelledError } from "./error/UserCancelledError";
import { mapPhaseAToPayload } from "@/mappers/phaseA.mapper";
import { mapPhaseBToPayload } from "@/mappers/phaseB.mapper";
import { renderPhaseB } from "@/ui/phase/phaseB";
import { getOrCreateShell } from "@/ui/shell";
import { createMockPhaseBProblem } from "@/mock/phaseBMock";
import { renderLoading } from "@/ui/loading";

export class CaptchaProcess {
  private _client: CaptchaClient | null = null;

  private getOrCreateClient(): CaptchaClient {
    return (this._client ??= createCaptchaClient());
  }

  async run(
    client_id: ClientID,
    abort_signal: AbortSignal,
  ): Promise<SessionID> {
    const shell = getOrCreateShell();

    renderLoading(shell);

    const session_id = await this.init(client_id);
    const initial = await this.request(session_id);

    return await this.captchaFlowLoop(session_id, initial, abort_signal);
  }

  private async init(client_id: ClientID): Promise<SessionID> {
    const shell = getOrCreateShell();
    const client = this.getOrCreateClient();
    const init_response = await shell.withLoading(
      () => client.init(client_id),
      0,
    );

    if (!init_response.success) {
      throw new Error(init_response.error ?? "INIT_FAILED");
    }

    return init_response.data.session_id;
  }

  private async request(session_id: SessionID): Promise<PhaseAResponse> {
    const shell = getOrCreateShell();
    const client = this.getOrCreateClient();
    const request_response = await shell.withLoading(
      () => client.request(session_id),
      0,
    );

    if (!request_response.success) {
      throw new Error(request_response.error ?? "REQUEST_FAILED");
    }

    return request_response;
  }

  private async captchaFlowLoop(
    session_id: SessionID,
    initial: PhaseAResponse,
    abort_signal: AbortSignal,
  ): Promise<SessionID> {
    let current: SubmitResponse = initial;
    console.log("initial", initial);

    while (current.success) {
      if (abort_signal.aborted) throw abort_signal.reason;

      try {
        switch (current.status) {
          case "PHASE_A":
            current = await this.handlePhaseA(session_id, current);
            // current = {
            //   data: {
            //     problem: createMockPhaseBProblem(),
            //   },
            //   status: "PHASE_B",
            //   success: true,
            // };
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
      } catch (e: any) {
        console.log("captchaFlowLoop error: ", e);
      }
      console.log("current", current);
    }

    throw new Error(current.error ?? "REQUEST_FAILED");
  }

  private async handlePhaseA(
    session_id: SessionID,
    current: PhaseAResponse,
  ): Promise<SubmitResponse> {
    const shell = getOrCreateShell();
    const client = this.getOrCreateClient();
    const { problem } = current.data;

    shell.setup(problem);
    shell.startTimer();

    const result = await renderPhaseA(problem, shell, {
      debugGuideLine: true,
    });

    if (result.cancelled) {
      switch (result.reason) {
        case "TIMEOUT":
          return await shell.withLoading(
            () =>
              client.submit(
                session_id,
                mapPhaseAToPayload({
                  cancelled: false,
                  raw_points: [],
                }),
              ),
            400,
          );
        case "ESC":
        case "CLOSE":
        case "CANCEL":
          throw new UserCancelledError();
        default:
          throw new Error("AUTH_FAILED");
      }
    }

    const payload = mapPhaseAToPayload(result);

    console.log("PHASE_A", payload);

    return await shell.withLoading(
      () => client.submit(session_id, payload),
      400,
    );
  }

  private async handlePhaseB(
    session_id: SessionID,
    current: PhaseBResponse,
  ): Promise<SubmitResponse> {
    console.log("handlePhaseB", current);
    const shell = getOrCreateShell();
    const client = this.getOrCreateClient();
    const { problem } = current.data;

    shell.setup(problem);
    shell.startTimer();

    const result = await renderPhaseB(problem, shell, {
      debugGuideLine: true,
    });
    console.log("result", result);

    if (result.cancelled) {
      switch (result.reason) {
        case "TIMEOUT":
          return await shell.withLoading(
            () =>
              client.submit(
                session_id,
                mapPhaseAToPayload({
                  cancelled: false,
                  raw_points: [],
                }),
              ),
            400,
          );
        case "ESC":
        case "CLOSE":
        case "CANCEL":
          throw new UserCancelledError();
        default:
          throw new Error("AUTH_FAILED");
      }
    }

    const payload = mapPhaseBToPayload(problem.grid, result);
    console.log("PHASE_B", payload);

    return await shell.withLoading(
      () => client.submit(session_id, payload),
      400,
    );
  }
}
