# tcurity-captcha-sdk

**tcurity-captcha-sdk**는 웹 애플리케이션에 T-Curity 캡차(Captcha) 서비스를 손쉽게 연동할 수 있도록 지원하는 클라이언트 사이드 SDK입니다.

## ✨ 주요 기능

- **간편한 연동**: 전역 객체 `TCuritySDK`를 통해 어디서든 접근 가능합니다.
- **비동기 처리**: `Promise` 기반으로 구현되어 검증 결과를 비동기적으로 처리할 수 있습니다.
- **UMD 지원**: 브라우저 환경에서 `<script>` 태그로 바로 로드하여 사용할 수 있도록 UMD 포맷으로 빌드됩니다.

## 📦 설치 및 사용 방법

이 SDK는 빌드 후 생성되는 `sdk.js` 파일을 웹 페이지에 포함하여 사용합니다.

### 1. 스크립트 로드

프로젝트 빌드 결과물(`dist/sdk.js`)을 HTML 파일에 추가합니다.

```html
<script src="./dist/sdk.js"></script>
```

### 2. 캡차 호출

window.TCuritySDK 객체를 통해 captcha 함수를 호출하여 검증을 시작합니다. clientId를 필수로 전달해야 하며, 성공 시 session_id를 반환받습니다.

```JavaScript

// 클라이언트 ID 설정 (필수)
const client_id = "YOUR_CLIENT_ID";

// 캡차 검증 요청
try {
    const result = await TCuritySDK.captcha(client_id);
    console.log("검증 성공! Session ID:", result.session_id);

    // TODO: 서버로 session_id 전송
  } catch (error) {
    console.error("검증 실패 또는 오류 발생:", error);
  }
```

## 🛠 개발 환경 설정

이 프로젝트는 TypeScript와 Vite를 기반으로 구성되어 있습니다.

### 전제 조건

- Node.js (v20 이상 권장)
- npm

### 설치

```Bash
npm install
```

### 로컬 개발 및 테스트

로컬에서 SDK를 개발하고, 로컬에 있는 다른 사이트가 이 SDK를 바로 참조할 수 있도록 개발 서버를 실행할 수 있습니다

```Bash
npm run dev
```

다른 사이트에서 SDK 참조

```HTML
<script src="http://localhost:3000/sdk.js"></script>
```

### 빌드

소스 코드를 수정하고 배포용 파일을 생성하려면 아래 명령어를 실행하세요. 빌드 결과물은 dist/ 디렉토리에 생성됩니다.

```Bash
npm run build
```

## 🚀 배포 (Deployment)

이 프로젝트는 GitHub Actions를 통해 dev 브랜치에 푸시될 때마다 자동으로 빌드되어 GitHub Pages에 배포되도록 설정되어 있습니다.

## 📂 폴더 구조

```bash
captcha-sdk-dev\
├── .github/workflows/ # GitHub Actions 설정 (배포 워크플로우)
├── src/
│   └── index.ts       # SDK 진입점 및 핵심 로직
├── dist/              # 빌드 결과물 (자동 생성)
├── package.json       # 프로젝트 의존성 및 스크립트
├── tsconfig.json      # TypeScript 설정
├── vite.config.ts     # Vite 번들러 설정
└── LICENSE            # 라이선스 파일
```

## 📄 라이선스 (License)

이 프로젝트는 MIT License에 따라 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.

Copyright (c) 2025 t-curity
