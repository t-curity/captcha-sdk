export const phaseACss = `
.tc-phase-a {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
}

.tc-phase-a-slot {
  position: relative;

  touch-action: none;
  user-select: none;
}

.tc-phase-a-slot img {
  display: block;
  max-width: 480px;

  pointer-events: none;
  -webkit-user-drag: none;
  user-select: none;
}

/* 쪼개지는 파편 공통 스타일 */
.tc-split-half {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  /* GPU에게 이 요소들이 바뀔 것임을 미리 알림 */
  will-change: transform, opacity, clip-path;

  /* 부드럽게 튕겨나가는 효과를 위한 커스텀 베지어 */
  filter: blur(0px);
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease;
  z-index: 10000;
  
  transform-origin: var(--split-pos) 50%;
}

/* 왼쪽 파편: 오른쪽을 가림 */
.tc-split-left {
  clip-path: inset(0 calc(100% - var(--split-pos, 50%)) 0 0);
}

/* 오른쪽 파편: 왼쪽을 가림 */
.tc-split-right {
  clip-path: inset(0 0 0 var(--split-pos, 50%));
}

/* 애니메이션 실행 시점 (is-splitting 클래스가 붙었을 때) */
.is-splitting .tc-split-left {
  filter: blur(4px);
  transform: translateX(calc(var(--left-speed) * -1px)) 
             translateY(-20px) 
             rotate(calc(var(--left-angle) * -1deg));
  opacity: 0;
}

.is-splitting .tc-split-right {
  transform: translateX(calc(var(--right-speed) * 1px)) 
             translateY(-20px) 
             rotate(calc(var(--right-angle) * 1deg));
  opacity: 0;
}

/* 애니메이션 도중 원본 이미지와 가이드는 숨김 */
.is-splitting .tc-main-img,
.is-splitting .tc-guide-band,
.is-splitting .tc-guide-center {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.1s;
}
  
.tc-guide-band {
  position: absolute;
  box-sizing: border-box;
  border: 1px dashed red;
  pointer-events: none;
  transform-origin: 0 50%
}
  
.tc-guide-center {
  position: absolute;
  box-sizing: border-box;
  border-top: 1px solid green;
  pointer-events: none;
  transform-origin: 0 50%;
}

.tc-guide-text {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}
`;
