// ui/phases/phaseA/phaseA.style.ts
export const phaseACss = `
.tc-phase-a {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
}

.tc-phase-bars {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.tc-phase-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
}

.tc-phase-bar.tc-active {
  background: #1976d2;
}
.tc-slot {
  position: relative;
}
.tc-slot img {
  display: block;
  max-width: 480px;
}
.tc-guide-band {
  position: absolute;
  border: 1px dashed red;
  pointer-events: none;
  transform-origin: 0 50%
}
.tc-guide-center {
  position: absolute;
  border-top = 1px solid green;
  pointer-events = none;
  transform-origin = 0 0;
}
.tc-guide-text {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}
`;
