// ui/phases/phaseA/phaseA.style.ts
export const phaseBaseCss = `
.tc-phase {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
}

.tc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
  
.tc-body {
  position: relative;
}

.tc-phase-bars {
  display: flex;
  gap: 6px;
  width: 100%;
}

.tc-phase-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  overflow: hidden;
}

.tc-phase-bar__fill {
  height: 100%;
  width: 0%;
  background: #1976d2;
  transition: width 200ms ease;
}

.tc-close {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
`;
