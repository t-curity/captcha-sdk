import { createDeviceMetadata } from "@/utils/device-metadata";
import { toViewportPointerEvents } from "@/mappers/raw-points.mapper";
import type { CaptchaPayload } from "@/types/contracts/protocol";
import { RawPointerEvent } from "@/types/input-event/RawPointerEventModel";

export function mapPhaseAToPayload(
  raw_points: RawPointerEvent[],
): CaptchaPayload {
  return {
    points: toViewportPointerEvents(raw_points),
    metadata: createDeviceMetadata(),
  };
}
