# tcurity-captcha-sdk

**tcurity-captcha-sdk**는 웹 애플리케이션에 **T-Curity 2-Phase CAPTCHA 서비스**를 간단히 연동할 수 있도록 제공되는 **브라우저 전용 클라이언트 사이드 SDK**입니다.

이 SDK는 **프론트엔드를 신뢰하지 않는 구조**를 전제로 설계되었으며,
최종 검증은 반드시 **서버 간(S2S) 통신**을 통해 수행되도록 구성되어 있습니다.

---

## ✨ 주요 특징

- **단일 파일 SDK**

  `<script>` 태그 하나로 바로 연동 가능 (`sdk.js`)

- **전역 접근 방식**

  `window.TCuritySDK`를 통해 어디서든 사용 가능

- **비동기 API**

  `Promise` 기반 CAPTCHA 실행 흐름

- **프론트 비신뢰 설계**

  CAPTCHA 결과의 최종 검증은 서버(S2S)에서만 수행

- **환경 분리 지원**

  dev / prod / local 환경을 런타임 설정으로 제어 가능

---

## 📦 사용 방법

### 1. SDK 로드

빌드 결과물인 `sdk.js`를 HTML에 포함합니다.

```html
<script src="https://your-cdn-path/sdk.js"></script>
```

---

### 2. (선택) 런타임 환경 설정

SDK는 실행 시점에 `window.__TCURITY__` 설정을 읽습니다.

```html
<script>
  window.__TCURITY__ = {
    mode: "prod", // local | dev | prod
    baseUrl: "https://api.tcurity.cloud",
    timeoutMs: 15000,
  };
</script>
```

> ⚠️ 이 설정은 **보안 수단이 아닙니다.**
> 환경 제어 목적이며, 보안은 서버(S2S)에서 보장됩니다.

---

### 3. CAPTCHA 실행

```html
<script>
  async function runCaptcha() {
    try {
      const sessionId = await TCuritySDK.captcha("YOUR_CLIENT_ID");
      console.log("CAPTCHA 성공:", sessionId);

      // TODO: sessionId를 서버로 전달하여 S2S 검증 수행
    } catch (err) {
      console.error("CAPTCHA 실패 또는 취소:", err);
    }
  }
</script>
```

---

## 🔐 보안 모델

이 SDK는 다음 원칙을 따릅니다.

- 프론트엔드는 **신뢰하지 않음**
- CAPTCHA 세션은 **서버에서만 검증**
- 프론트는 결과를 **전달만** 함
- CAPTCHA 통과 여부는 **S2S Verify 결과만 유효**

```text
브라우저
  ↓
TCuritySDK.captcha()
  ↓
CAPTCHA 서버 (세션 발급)
  ↓
session_id 반환
  ↓
고객사 서버 → T-Curity 서버 (S2S Verify)
```

> 프론트 요청의 URL, Origin, Header는
> 보안 판단 기준으로 사용되지 않습니다.

---

## 🛠 개발 환경

### 전제 조건

- Node.js (v20 이상 권장)
- npm

### 설치

```Bash
npm install
```

### 로컬 개발

```Bash
npm run dev
```

다른 프로젝트에서 SDK 참조

```HTML
<script src="http://localhost:3000/sdk.js"></script>
```

### 빌드

```Bash
npm run build:prod
```

결과물:

```
dist/
 ├─ sdk.js
 └─ index.d.ts
```

---

## 🚀 배포

- `dev` 브랜치에 push 시
- GitHub Actions를 통해 자동 빌드
- GitHub Pages로 배포

---

## 📂 프로젝트 구조

```bash
captcha-sdk-dev\
├── .github/workflows/ # GitHub Actions 설정 (배포 워크플로우)
├── src/
│   └── index.ts       # SDK 진입점 및 핵심 로직
├── dist/              # 빌드 결과물
├── package.json       # 프로젝트 의존성 및 스크립트
├── tsconfig.json      # TypeScript 설정
├── vite.config.ts     # Vite 번들러 설정
└── LICENSE            # 라이선스 파일
```

## 📄 라이선스 (License)

이 프로젝트는 MIT License에 따라 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.

Copyright (c) 2025 t-curity
