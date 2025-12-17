export type SessionID = string;
export type Status = "INIT" | "PHASE_A" | "PHASE_B" | "COMPLETED";
export type PointerEventType = "down" | "move" | "up" | "move_out" | "cancel";
export type Base64 = string;
export type Message = string;
export type TimeLimit = number;
export type ImageID = string;
export type Answer = [A1: ImageID, A2: ImageID, A3: ImageID, A4: ImageID];

// 0..1 정규화 좌표
export type NormalizedPoint = [
  x: number, // 0..1
  y: number, // 0..1
];

export type GuideLine = {
  start: NormalizedPoint;
  end: NormalizedPoint;
  width: number; // 0..1 (전체 허용 폭)
};

export type TracePoint = [
  ...NormalizedPoint,
  t: number, // timestamp (ms)
  event_type: PointerEventType,
];
export type BehaviorPatternData = TracePoint[];

export type PhaseAProblem = {
  image: Base64;
  guide_line?: GuideLine;
  guide_text: Message;
  time_limit: TimeLimit;
};

export type PhaseBProblem = {
  images: Base64[];
  question: Message;
  time_limit: TimeLimit;
};

export type CaptchaResponse =
  | {
      status: "INIT";
      session_id: SessionID;
    }
  | {
      status: "PHASE_A";
      problem: PhaseAProblem;
    }
  | {
      status: "PHASE_B";
      problem: PhaseBProblem;
    }
  | {
      status: "COMPLETED";
    };

export type CaptchaPayload =
  | {
      phase: "PHASE_A";
      behavior_pattern_data: BehaviorPatternData;
    }
  | {
      phase: "PHASE_B";
      behavior_pattern_data: BehaviorPatternData;
      answer: Answer;
    };
