export const THEME = {
  // 상태별 색상 설정
  color: {
    primary: "#ffffff",
    pass: "#00ff00",
    fail: "#ff0000",
  },

  // 캔버스 드로잉 설정
  draw: {
    width: 2.5,
    glowColor: "rgba(0, 0, 0, 0.8)",
    glowBlur: 3,
    passGlowColor: "rgba(0, 255, 0, 0.6)",
    passGlowBlur: 8,
    failGlowColor: "rgba(255, 0, 0, 0.8)",
    failGlowBlur: 12,
  },

  // 시간 설정
  duration: {
    passDraw: 1000,
    failDraw: 1000,
    shake: 300,
    abortGrace: 500,
    returnFlight: 300,
  },
} as const;
