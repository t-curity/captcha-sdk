import { DeviceMetadata, DeviceType } from "@/types/contracts/protocol";

export function createDeviceMetadata(): DeviceMetadata {
  return {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    deviceType: detectDeviceType(),
  };
}

function detectDeviceType(): DeviceType {
  const hasTouch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;

  if (hasTouch) return "MOBILE";

  return "PC";
}
