export const phaseBCss = `
.tc-phase-b,
.tc-grid,
.tc-cell,
.tc-slots,
.tc-slot {
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
  touch-action: none;
  --slot-size: 90px;
}

.tc-cell img {
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

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
  opacity: 0.3;
  filter: grayscale(0.8);
  cursor: default;
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
  border: 2px solid transparent;
  border-radius: 8px;
  background: #f5f5f5;
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

.tc-drag-ghost {
  position: absolute;
  width: 72px;
  height: 72px;
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
`;
