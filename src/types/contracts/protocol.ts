import type { Status } from "@/types/contracts/status";
import type { SessionID, ImageID } from "@/types/contracts/primitives";
import type { PointerEvents } from "@/types/contracts/behavior";
import type { PhaseAProblem, PhaseBProblem } from "@/types/contracts/problems";

export type Answer = [A1: ImageID, A2: ImageID, A3: ImageID, A4: ImageID];

export interface CaptchaResult<S extends Status = Status> {
  success: true;
  status: S;
}

export type CommonResult<T, S extends Status = Status> = CaptchaResult<S> & {
  data: T;
};

export interface HttpErrorResult {
  success: false;
  error: string;
  message: string;
}

export type SessionIDResult = CommonResult<{ session_id: SessionID }, "INIT">;
export type PhaseAResult = CommonResult<{ problem: PhaseAProblem }, "PHASE_A">;
export type PhaseBResult = CommonResult<{ problem: PhaseBProblem }, "PHASE_B">;
export type CompletedResult = CaptchaResult<"COMPLETED">;

export type InitResponse = SessionIDResult | HttpErrorResult;
export type RequestResponse = PhaseAResult | HttpErrorResult;
export type SubmitResponse =
  | PhaseAResult
  | PhaseBResult
  | CompletedResult
  | HttpErrorResult;

export type ApiResponse = CaptchaResult | HttpErrorResult;

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
