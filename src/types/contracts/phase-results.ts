import type { RawPointerEvent } from "@/ui/types/RawPointerEventModel";
import { Answer } from "./protocol";

export type AbortReason = "ESC" | "CLOSE" | "CANCEL" | "NAVIGATE";

export type PhaseAResult =
  | {
      cancelled: false;
      raw_points: RawPointerEvent[];
    }
  | {
      cancelled: true;
      reason: AbortReason;
    };

export type PhaseBResult =
  | {
      cancelled: false;
      raw_points: RawPointerEvent[];
      user_answer: Answer;
    }
  | {
      cancelled: true;
      reason: AbortReason;
    };
