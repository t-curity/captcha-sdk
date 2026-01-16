export const phaseACss = `
.tc-phase-a {
  background: #fff;
  padding: 0 0 16px;
}

.tc-phase-a-slot {
  position: relative;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);

  touch-action: none;
  user-select: none;
}

.tc-phase-a-slot img {
  display: block;
  max-width: 100%;
  width: 100%;

  pointer-events: none;
  -webkit-user-drag: none;
  user-select: none;
}

/* 드래그 핸들 */
.tc-drag-handle {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 
              0 0 0 2px rgba(255, 255, 255, 0.8),
              inset 0 1px 2px rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 100;
  transform: translate(-50%, -50%);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  pointer-events: auto;
}

.tc-drag-handle:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25), 
              0 0 0 2px rgba(255, 255, 255, 0.9),
              inset 0 1px 2px rgba(255, 255, 255, 0.9);
}

.tc-drag-handle:active,
.tc-drag-handle.dragging {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 
              0 0 0 2px rgba(255, 255, 255, 0.8),
              inset 0 1px 2px rgba(255, 255, 255, 0.9);
}

.tc-drag-handle-icon {
  width: 20px;
  height: 20px;
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tc-drag-handle-icon svg {
  width: 100%;
  height: 100%;
}

/* 드래그 핸들 펄스 애니메이션 */
.tc-drag-handle::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.25);
  animation: tc-pulse 2s ease-in-out infinite;
}

@keyframes tc-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.tc-drag-handle.dragging::before {
  animation: none;
  opacity: 0;
}

/* 쪼개지는 파편 공통 스타일 */
.tc-split-half {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  will-change: transform, opacity, clip-path;

  filter: blur(0px);
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
  z-index: 10000;
  
  transform-origin: var(--split-pos) 50%;
}

/* 왼쪽 파편 */
.tc-split-left {
  clip-path: inset(0 calc(100% - var(--split-pos, 50%)) 0 0);
}

/* 오른쪽 파편 */
.tc-split-right {
  clip-path: inset(0 0 0 var(--split-pos, 50%));
}

/* 애니메이션 실행 */
.is-splitting .tc-split-left {
  transform: translateX(calc(var(--left-speed) * -1px)) 
             translateY(-15px) 
             rotate(calc(var(--left-angle) * -1deg));
  opacity: 0;
}

.is-splitting .tc-split-right {
  transform: translateX(calc(var(--right-speed) * 1px)) 
             translateY(-15px) 
             rotate(calc(var(--right-angle) * 1deg));
  opacity: 0;
}

/* 애니메이션 도중 원본 숨김 */
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
  border: 2px dashed #f43f5e;
  pointer-events: none;
  transform-origin: 0 50%;
  opacity: 0.8;
}
  
.tc-guide-center {
  position: absolute;
  box-sizing: border-box;
  border-top: 2px solid #10b981;
  pointer-events: none;
  transform-origin: 0 50%;
}

.tc-guide-text {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
}
`;
