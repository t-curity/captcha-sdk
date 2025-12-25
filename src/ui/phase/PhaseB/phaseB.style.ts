export const phaseBCss = `
.tc-phase-b,
.tc-grid,
.tc-cell,
.tc-slots,
.tc-slot {
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  touch-action: none; /* 모바일에서 스크롤/줌 방지 */
  --slot-size: 90px;
}

.tc-cell img {
  pointer-events: none; /* 이벤트는 cell이 받게 */
  user-select: none;
  -webkit-user-drag: none;
}

.tc-phase-b {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
}

.tc-question {
  text-align: center;
  font-size: 14px;
  margin: 8px;
  font-weight: 500;
}

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
  background: #f2f2f2;
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

.tc-cell.is-dragging {
  outline: 2px solid #4caf50;
  opacity: 0.85;
}

.tc-cell.is-used {
  opacity: 0.4;
}

.tc-cell.shake {
  animation: shake 0.3s;
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
}

.tc-slots {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 1fr;
  gap: 8px;
  background-color: #f0f0f0ff;
  padding: 8px;
  border-radius: 8px;
}

.tc-slot {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  border: 0px dashed #ccc;
  border-radius: 8px;
  background: #cececeff;
  display: flex;
  align-items: center;
  justify-content: center;
  
  width: var(--slot-size);
  height: var(--slot-size);
  max-width: var(--slot-size);
  max-height: var(--slot-size);
  overflow: hidden;
}

.tc-slot.is-hover {
  border-color: #4caf50;
  background: #f0fff4;
}

.tc-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}
  
.tc-slot-order {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4caf50;
  color: #fff;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tc-drag-ghost {
  position: fixed;
  width: 72px;
  height: 72px;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.9;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  position: absolute;
}

.tc-drag-ghost img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
`;
