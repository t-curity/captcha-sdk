import { createDeviceMetadata } from "@/utils/device-metadata";
import { toViewportPointerEvents } from "@/mappers/raw-points.mapper";
import type { Answer, CaptchaPayload } from "@/types/contracts/protocol";
import { PhaseBSuccessResult } from "@/types/contracts/phase-results";
import { ImageGrid } from "@/types/contracts/primitives";

export function mapPhaseBToPayload(
  grid: ImageGrid,
  result: PhaseBSuccessResult,
): CaptchaPayload {
  return {
    points: toViewportPointerEvents(result.raw_points),
    user_answer: mapSelectedIndexToAnswer(grid, result.selecteds),
    metadata: createDeviceMetadata(),
  };
}

function mapSelectedIndexToAnswer(
  grid: ImageGrid,
  selecteds: number[],
): Answer {
  return selecteds.map((selected) => grid[selected].image_id) as Answer;
}
