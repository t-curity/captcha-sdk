import type { RawPointerEvent } from "@/ui/input/raw";

export type AbortReason = "ESC" | "CLOSE" | "CANCEL" | "TIMEOUT" | "NAVIGATE";
export interface PhaseASuccessResult {
  cancelled: false;
  raw_points: RawPointerEvent[];
}

export interface PhaseBSuccessResult {
  cancelled: false;
  raw_points: RawPointerEvent[];
  selecteds: number[];
}

export interface PhaseCancelledResult {
  cancelled: true;
  reason: AbortReason;
}

export type PhaseAResult = PhaseASuccessResult | PhaseCancelledResult;

export type PhaseBResult = PhaseBSuccessResult | PhaseCancelledResult;
