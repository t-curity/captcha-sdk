import { DeviceMetadata, DeviceType } from "@/types/contracts/protocol";

export function createDeviceMetadata(): DeviceMetadata {
  return {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    deviceType: detectDeviceType(),
  };
}

function detectDeviceType(): DeviceType {
  const hasTouch = navigator.maxTouchPoints > 0;
  const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
  const hasHover = window.matchMedia("(hover: hover)").matches;

  if (isSmallScreen && hasTouch) {
    return "MOBILE";
  }

  if (hasTouch && hasHover) {
    // 터치 + 마우스 둘 다 가능한 환경
    return "PC";
  }

  return "PC";
}
