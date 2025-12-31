export const phaseBCss = `
/* =========================================================
 * Phase B – Design Tokens / Variables
 * ======================================================= */
.tc-phase-b {
  /* colors */
  --tc-primary: #4caf50;      /* 활성/성공 (Green) */
  --tc-danger: #ff4d4f;       /* 삭제/주의 (Red) */
  --tc-bg-neutral: #f2f2f2;   /* 기본 배경 (Gray) */
  --tc-slot-bg: #cecece;      /* 슬롯 기본 배경 */

  /* size */
  --slot-size: 90px;
  --ghost-size: 72px;

  /* opacity */
  --opacity-used: 0.3;

  /* duration */
  --dur-fast: 0.15s;
  --dur-base: 0.3s;

  /* easing */
  --ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* =========================================================
 * Input Control (공통 입력 차단)
 * ======================================================= */
.tc-phase-b,
.tc-grid,
.tc-cell,
.tc-phase-b-slots,
.tc-phase-b-slot {
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  touch-action: none;
}

.tc-cell img {
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

/* =========================================================
 * Layout / Structure
 * ======================================================= */
.tc-phase-b {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  user-select: none;

  /* 초기 상태: 투명하고 살짝 작음 */
  opacity: 0;
  transform: scale(0.95);
  
  /* 0.6초 동안 서서히 나타남 (A의 쪼개지는 시간과 맞춤) */
  animation: tc-phase-appear 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes tc-phase-appear {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
    filter: blur(4px); /* 살짝 흐릿하게 시작하면 더 몽환적입니다 */
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

.tc-question {
  text-align: center;
  font-size: 14px;
  margin: 8px;
  font-weight: 500;
}

/* Grid */
.tc-grid {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.tc-grid::after {
  content: ""; 
  position: absolute;
  /* 부모인 .tc-grid의 전체 면적을 꽉 채움 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  /* 내부 Cell들보다 위에 올라오도록 z-index 부여 */
  z-index: 99; 
  pointer-events: none; /* 마우스 이벤트를 방해하지 않음 */
  
  box-shadow: inset 0 0 40px 5px rgba(82, 196, 26, 0.25);
  background-color: rgba(82, 196, 26, 0.05);
  
  /* 애니메이션 효과 */
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 3. JS에서 .is-drag-over 클래스가 붙었을 때 ::after를 보여줌 */
.tc-grid.is-drag-over::after {
  opacity: 1;
}

.tc-cell {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  overflow: hidden;
  background: var(--tc-bg-neutral);
  cursor: grab;
}

.tc-cell:active {
  cursor: grabbing;
}

.tc-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Slots */
.tc-phase-b-slots {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 8px;
  background: #f0f0f0;
  border-radius: 8px;
}

.tc-phase-b-slot {
  position: relative;
  width: var(--slot-size);
  height: var(--slot-size);
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  background: #cecece;
  border: 2px solid transparent;

  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.tc-phase-b-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

/* =========================================================
 * State (의미 기반 – 애니메이션 없음)
 * ======================================================= */
.tc-cell.is-dragging {
  outline: 3px solid var(--tc-primary);
  outline-offset: -3px;
  opacity: 0.8;
}

.tc-cell.is-used {
  opacity: var(--opacity-used);
  filter: grayscale(0.8);
  cursor: default;
}

.tc-phase-b-slot.has-image:hover {
  cursor: grab;
}

.tc-phase-b-slot.is-hover {
  border-color: var(--tc-primary);
  background: #f0fff4;
}

.tc-phase-b-slot.is-dragging {
  outline: 3px solid var(--tc-primary);
  outline-offset: -3px;
  opacity: 0.8;
}

/* =========================================================
 * Effects / Animations
 * ======================================================= */
/* Shake (그리드 실패 피드백) */
.tc-cell.shake {
  animation: shake var(--dur-base);
}

@keyframes shake {
  0%   { transform: translateX(0); }
  25%  { transform: translateX(-4px); }
  50%  { transform: translateX(4px); }
  75%  { transform: translateX(-4px); }
  100% { transform: translateX(0); }
}

/* Return / Swap Flight */
.tc-return-flight {
  position: absolute;
  pointer-events: none;
  z-index: 10000;

  transition:
    left   var(--dur-base) var(--ease-elastic),
    top    var(--dur-base) var(--ease-elastic),
    width  var(--dur-base) var(--ease-elastic),
    height var(--dur-base) var(--ease-elastic),
    opacity var(--dur-base),
    transform var(--dur-base);
}

/* Drag Ghost */
.tc-drag-ghost {
  position: absolute;
  width: var(--ghost-size);
  height: var(--ghost-size);
  pointer-events: none;
  z-index: 9999;

  opacity: 0.9;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
}

.tc-drag-ghost img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 삭제 버튼 (배지) 기본 스타일 */
.tc-remove-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  background: var(--tc-danger);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  z-index: 100;
  
  /* 등장 애니메이션 */
  opacity: 0;
  transform: scale(0.5);
  transition: opacity var(--dur-fast), transform var(--dur-fast);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

/* 슬롯 호버 시 버튼 노출 */
.tc-phase-b-slot.has-image:hover .tc-remove-badge {
  opacity: 0.7;
  transform: scale(1);
}

/* 버튼에 마우스 올렸을 때 더 강조 */
.tc-phase-b-slot.has-image:hover .tc-remove-badge:hover {
  opacity: 1;
  transform: scale(1.1) !important;
}
`;
