import { TracePoint } from "@/api/captcha.types";

export type UIAbortReason = "ESC" | "CLOSE";

export type PhaseAResult =
  | {
      cancelled: false;
      behavior_pattern_data: TracePoint[];
    }
  | {
      cancelled: true;
      reason: UIAbortReason;
    };

export type PhaseBResult =
  | {
      cancelled: false;
      behavior_pattern_data: TracePoint[];
      selectedIndexes: number[];
    }
  | {
      cancelled: true;
      reason: UIAbortReason;
    };
