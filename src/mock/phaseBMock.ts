import { PhaseBProblem } from "@/types/contracts/problems";
import { MockImageLoader } from "./MockImageLoader";

export function createMockPhaseBProblem(): PhaseBProblem {
  const loader = new MockImageLoader();
  const images = loader.problemImages();

  return {
    question: "동물만 순서대로 선택하세요",
    grid: shuffle(
      images.map((image) => ({ image_id: image.id, image: image.image })),
    ),
    phase: "2/2",
    time_limit: 5,
  };
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
