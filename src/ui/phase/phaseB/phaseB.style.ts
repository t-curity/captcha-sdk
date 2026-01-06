export const phaseBCss = `
/* =========================================================
 * Phase B Style
 * ======================================================= */
.tc-phase-b {
  /* colors */
  --tc-primary: #6366f1;
  --tc-primary-light: #818cf8;
  --tc-danger: #f43f5e;
  --tc-bg-neutral: #f3f4f6;
  --tc-slot-bg: #e5e7eb;
  --tc-slot-drag: #d1d5db;

  /* opacity */
  --opacity-used: 0.3;

  /* duration */
  --dur-fast: 0.15s;
  --dur-base: 0.2s;

  /* easing */
  --ease-elastic: cubic-bezier(0.22, 1, 0.36, 1);
}

/* =========================================================
 * Input Control
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
  user-select: none;
}

.tc-question {
  text-align: center;
  font-size: 16px;
  margin: 0 0 20px;
  font-weight: 600;
  color: #111827;
}

.tc-question strong {
  color: var(--tc-primary);
}

/* Grid */
.tc-grid {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.tc-grid::after {
  content: ""; 
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99; 
  pointer-events: none;
  
  box-shadow: inset 0 0 40px 5px rgba(125, 127, 244, 0.35);
  background-color: rgba(99, 102, 241, 0.05);
  border-radius: 16px;
  
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tc-grid.is-drag-over::after {
  opacity: 1;
}

.tc-cell {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  overflow: hidden;
  background: var(--tc-bg-neutral);
  cursor: grab;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
}

.tc-cell:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
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
  gap: 10px;
  padding: 16px;
  background: var(--tc-bg-neutral);
  border-radius: 20px;
}

.tc-phase-b-slot {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  background: var(--tc-slot-bg);
  border: 2px dashed #d1d5db;

  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  transition: all 0.2s ease;
}

.tc-phase-b-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

/* =========================================================
 * State
 * ======================================================= */
.tc-cell.is-picking {
  outline: 3px solid var(--tc-primary);
  outline-offset: -3px;
  opacity: 0.5;
}

.tc-cell.is-used {
  opacity: var(--opacity-used);
  filter: grayscale(0.6);
  cursor: default;
}

.tc-phase-b-slot.has-image {
  cursor: grab;
}

.tc-phase-b-slot:not(.has-image) {
  cursor: default;
}

.tc-phase-b-slot:not(.has-image) img {
  display: none;
}

.tc-phase-b-slot.is-snapping {
  outline: 3px solid var(--tc-primary);
  outline-offset: -3px;
  background: rgba(99, 102, 241, 0.1);
}

.tc-phase-b-slot.is-picking {
  outline: 2px dashed var(--tc-slot-drag);
  outline-offset: -2px;
}
  
.tc-phase-b-slot.is-snapping.is-picking {
  outline: 3px solid var(--tc-primary);
  outline-offset: -3px;
}
  
.tc-phase-b-slot.is-snapping img {
  opacity: 0.3;
}

.tc-phase-b-slot.is-picking img {
  opacity: 0.6;
}

.tc-phase-b-slot.is-snapping.is-picking img {
  opacity: 0.3;
}

.tc-phase-root.is-grabbing {
  cursor: grabbing;
}
  
/* =========================================================
 * Effects / Animations
 * ======================================================= */
/* Shake */
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
  border-radius: 14px;

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
  pointer-events: none;
  z-index: 9999;

  opacity: 0.95;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  
  transform: scale(0.9);
  transition: transform 0.15s ease;
}

.tc-drag-ghost.is-snapped {
  transform: scale(0.85);
  transition: left 0.02s ease-out, 
              top 0.02s ease-out;
}

.tc-drag-ghost img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 삭제 버튼 */
.tc-remove-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  background: var(--tc-danger);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  z-index: 100;
  
  opacity: 0;
  transform: scale(0.5);
  transition: opacity var(--dur-fast), transform var(--dur-fast);
  box-shadow: 0 2px 8px rgba(244, 63, 94, 0.4);
}

.tc-phase-b-slot.has-image:hover .tc-remove-badge {
  opacity: 1;
  transform: scale(1);
}

.tc-phase-b-slot.has-image:hover .tc-remove-badge:hover {
  transform: scale(1.1);
}

.tc-phase-b-slot.has-image.is-snapping .tc-remove-badge {
  opacity: 0;
}
`;
