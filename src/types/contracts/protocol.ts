import type { Status } from "@/types/contracts/status";
import type { SessionID, ImageID } from "@/types/contracts/primitives";
import type { PointerEvents } from "@/types/contracts/behavior";
import type { PhaseAProblem, PhaseBProblem } from "@/types/contracts/problems";

export type Answer = [A1: ImageID, A2: ImageID, A3: ImageID, A4: ImageID];

export interface CaptchaResponse<S extends Status = Status> {
  success: true;
  status: S;
}

export type CommonResponse<
  T,
  S extends Status = Status,
> = CaptchaResponse<S> & {
  data: T;
};

export interface APIErrorResponse {
  success: false;
  error: string;
  message: string;
}

export type SessionIDResponse = CommonResponse<
  { session_id: SessionID },
  "INIT"
>;
export type PhaseAResponse = CommonResponse<
  { problem: PhaseAProblem },
  "PHASE_A"
>;
export type PhaseBResponse = CommonResponse<
  { problem: PhaseBProblem },
  "PHASE_B"
>;
export type CompletedResponse = CaptchaResponse<"COMPLETED">;

export type InitResponse = SessionIDResponse | APIErrorResponse;
export type RequestResponse = PhaseAResponse | APIErrorResponse;
export type SubmitResponse =
  | PhaseAResponse
  | PhaseBResponse
  | CompletedResponse
  | APIErrorResponse;

export type ApiResponse = CaptchaResponse | APIErrorResponse;

export type DeviceType = "MOBILE" | "PC";

export type DeviceMetadata = {
  screenWidth: number;
  screenHeight: number;
  deviceType: DeviceType;
};

export type CaptchaPayload = {
  points: PointerEvents;
  user_answer?: Answer;
  metadata: DeviceMetadata;
};
