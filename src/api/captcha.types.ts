export type SessionID = string;
export type Status = "INIT" | "PHASE_A" | "PHASE_B" | "COMPLETED";
export type MouseEventType = "down" | "move" | "up";
export type Base64 = string;
export type Message = string;
export type TimeLimit = number;
export type ImageID = string;
export type Answer = [A1: ImageID, A2: ImageID, A3: ImageID, A4: ImageID];

export type Rectangle = [x: number, y: number, width: number, height: number];
export type MouseEvent = [
  event_type: MouseEventType,
  x: number,
  y: number,
  t: number,
];
export type BehaviorPatternData = MouseEvent[];

export type PhaseAProblem = {
  image: Base64;
  cut_rectangle?: Rectangle;
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
      status: "PHASE_A" | "PHASE_B";
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
