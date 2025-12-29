import { createDeviceMetadata } from "@/utils/device-metadata";
import { toViewportPointerEvents } from "@/mappers/raw-points.mapper";
import type { CaptchaPayload } from "@/types/contracts/protocol";
import { PhaseASuccessResult } from "@/types/contracts/phase-results";

export function mapPhaseAToPayload(
  result: PhaseASuccessResult,
): CaptchaPayload {
  return {
    points: toViewportPointerEvents(result.raw_points),
    metadata: createDeviceMetadata(),
  };
}
