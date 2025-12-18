import { StrokePoint } from "@/stroke/StrokeModel";

export type UIAbortReason = "ESC" | "CLOSE";

export type PhaseAResult =
  | {
      cancelled: false;
      strokes: StrokePoint[];
    }
  | {
      cancelled: true;
      reason: UIAbortReason;
    };

export type PhaseBResult =
  | {
      cancelled: false;
      strokes: StrokePoint[];
      selectedIndexes: number[];
    }
  | {
      cancelled: true;
      reason: UIAbortReason;
    };
