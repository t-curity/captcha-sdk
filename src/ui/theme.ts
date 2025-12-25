export const THEME = {
  // 상태별 색상
  color: {
    primary: "#ffffff",
    pass: "#00ff00",
    fail: "#ff0000",
  },

  // 캔버스 드로잉 설정
  draw: {
    width: 2.5,
    glow: "rgba(0, 0, 0, 0.8)",
    blur: 3,
    passGlow: "rgba(0, 255, 0, 0.6)",
    passBlur: 8,
    failGlow: "rgba(255, 0, 0, 0.8)",
    failBlur: 12,
  },

  // 애니메이션 시간
  duration: {
    passDraw: 1000,
    failDraw: 1000,
    shake: 300,
  },
} as const;
