import type {
  Status,
  CaptchaResponse,
  SessionID,
  PhaseAProblem,
  PhaseBProblem,
  Answer,
} from "./captcha.types";
import type { CaptchaClient } from "./CaptchaClient";
import { MockImageLoader } from "@/mock/MockImageLoader";

interface MockSession {
  status: Status;
  submitCount: number;
}

export class MockCaptchaClient implements CaptchaClient {
  private sessions = new Map<SessionID, MockSession>();
  private loader = new MockImageLoader();

  async init(_client_id: string): Promise<CaptchaResponse> {
    const session_id = crypto.randomUUID() as SessionID;

    // client_id 검증은 생략

    this.sessions.set(session_id, {
      status: "INIT",
      submitCount: 0,
    });

    return {
      status: "INIT",
      session_id: session_id,
    };
  }

  async request(session_id: string): Promise<CaptchaResponse> {
    const session = this.sessions.get(session_id);

    if (!session) throw new Error("SESSION_NOT_FOUND");

    if (session.status !== "INIT") {
      throw new Error("INVALID_STATE");
    }

    this.sessions.set(session_id, {
      ...session,
      status: "PHASE_A",
      submitCount: 0,
    });

    return {
      status: "PHASE_A",
      problem: this.phaseA(),
    };
  }

  async submit(session_id: string, _: any): Promise<CaptchaResponse> {
    const session = this.sessions.get(session_id);

    if (!session) throw new Error("SESSION_NOT_FOUND");

    session.submitCount++;

    switch (session.status) {
      case "PHASE_A":
        // A는 통과로 간주

        let problem = this.phaseB();

        this.sessions.set(session_id, {
          ...session,
          status: "PHASE_B",
          submitCount: 0,
        });

        return {
          status: "PHASE_B",
          problem: problem,
        };
      case "PHASE_B":
        // B는 통과로 간주

        this.sessions.set(session_id, {
          ...session,
          status: "COMPLETED",
        });

        return {
          status: "COMPLETED",
        };
      default:
        throw new Error("INVALID_STATE");
    }
  }

  private phaseA(): PhaseAProblem {
    return {
      image: this.loader.ticket(),
      cut_rectangle: [40, 0, 10, 40],
      guide_text: "절취선을 따라 선을 그려주세요",
      time_limit: 30,
    };
  }

  private phaseB(): PhaseBProblem {
    return {
      images: this.loader.problemImages().map((p) => p.image),
      question: "다음 중 토끼를 번호가 작은 것부터 순서대로 나열하세요",
      time_limit: 60,
    };
  }
}
