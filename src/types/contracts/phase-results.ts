import type { RawPointerEvent } from "@/types/input-event/RawPointerEventModel";

export type AbortReason = "ESC" | "CLOSE" | "CANCEL";

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
      selected_indexes: number[];
    }
  | {
      cancelled: true;
      reason: AbortReason;
    };
