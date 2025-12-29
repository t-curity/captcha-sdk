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
  --opacity-placeholder: 0.2;

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
}

.tc-question {
  text-align: center;
  font-size: 14px;
  margin: 8px;
  font-weight: 500;
}

/* Grid */
.tc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
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
  outline: 2px solid var(--tc-primary);
  opacity: 0.85;
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

.tc-phase-b-slot.is-placeholder {
  opacity: var(--opacity-placeholder);
  filter: grayscale(1);
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
  position: fixed;
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
  transition: opacity 0.2s, transform 0.2s;
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

/* 드래그 중인 슬롯(잔상)에서는 삭제 버튼을 숨김 */
.tc-phase-b-slot.is-placeholder .tc-remove-badge {
  display: none;
}
`;
