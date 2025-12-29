import type {
  Base64,
  Message,
  TimeLimit,
  NormalizedLine,
  ImageGrid,
} from "@/types/contracts/primitives";

export type GuideLine = NormalizedLine & {
  width: number; // 0..1 (전체 허용 폭)
  min_progress_threshold?: number; // 0..1
};

export type Problem = {
  phase: Message;
  time_limit: TimeLimit;
};

export type PhaseAProblem = {
  guide_line: GuideLine;
  guide_text: Message;
  image: Base64;
} & Problem;

export type PhaseBProblem = {
  question: Message;
  grid: ImageGrid;
} & Problem;
