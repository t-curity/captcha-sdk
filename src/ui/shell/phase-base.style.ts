// ui/phases/phaseA/phaseA.style.ts
export const phaseBaseCss = `
.tc-phase {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  max-width: 480px;
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
  margin-bottom: 12px;
}

.tc-phase-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
}

.tc-close {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
`;
