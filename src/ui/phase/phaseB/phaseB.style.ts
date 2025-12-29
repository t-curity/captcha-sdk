export const phaseBCss = `
.tc-phase-b,
.tc-grid,
.tc-cell,
.tc-phase-b-slots,
.tc-phase-b-slot {
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

.tc-phase-b-slots {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 1fr;
  gap: 8px;
  background-color: #f0f0f0ff;
  padding: 8px;
  border-radius: 8px;
}

.tc-phase-b-slot {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  border: 2px solid transparent;
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

.tc-phase-b-slot.is-hover {
  border-color: #4caf50;
  background: #f0fff4;
}

.tc-phase-b-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

.tc-phase-b-slot.has-image:hover::after {
  content: '✕';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  border-radius: 8px;
  transition: opacity 0.2s;
}

.tc-return-flight {
  position: fixed;
  pointer-events: none;
  z-index: 10000;
  transition: left 0.3s ease-in-out, top 0.4s ease-in-out, width 0.4s ease-in-out, height 0.4s ease-in-out, opacity 0.4s ease;
  will-change: left, top, width, height;
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
