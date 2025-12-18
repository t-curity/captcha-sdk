import type {
  Base64,
  Message,
  TimeLimit,
  NormalizedPoint,
} from "@/types/contracts/primitives";

export type GuideLine = {
  start: NormalizedPoint;
  end: NormalizedPoint;
  width: number; // 0..1 (전체 허용 폭)
};

export type PhaseAProblem = {
  guide_line: GuideLine;
  guide_text: Message;
  image: Base64;
  phase: Message;
  time_limit: TimeLimit;
};

export type PhaseBProblem = {
  question: Message;
  images: Base64[];
  phase: Message;
  time_limit: TimeLimit;
};
