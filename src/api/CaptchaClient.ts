import { ClientID, SessionID } from "@/types/contracts/primitives";
import type {
  CaptchaPayload,
  InitResponse,
  RequestResponse,
  SubmitResponse,
} from "@/types/contracts/protocol";

export interface CaptchaClient {
  init(client_id: ClientID): Promise<InitResponse>;
  request(session_id: SessionID): Promise<RequestResponse>;
  submit(
    session_id: SessionID,
    payload: CaptchaPayload,
  ): Promise<SubmitResponse>;
}
