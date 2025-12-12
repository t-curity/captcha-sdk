let inFlight: Promise<{ session_id: string }> | null = null;

declare global {
  interface Window {
    TCuritySDK?: {
      captcha: (clientId: string) => Promise<{ session_id: string }>;
    };
  }
}

async function captcha(clientId: string): Promise<{ session_id: string }> {
  if (!clientId) {
    throw new Error("clientId is required");
  }

  // 🔒 단일 실행 lock
  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    // ✅ 더미 session_id (나중에 /session/init으로 교체)
    const session_id = `dummy-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    // 🔕 지금은 아무 것도 안 함
    // (나중에 여기서 UI / Phase A / B가 들어감)
    await new Promise((resolve) => setTimeout(resolve, 300));

    return { session_id };
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

// 🌍 글로벌 노출 (UMD 스타일)
window.TCuritySDK = {
  captcha,
};

export { captcha };
