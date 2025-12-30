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
  transition: width 100ms linear, background-color 0.3s ease;
}

.tc-shell-root.is-critical {
  border-color: #ff4d4f;
  box-shadow: 0 0 12px rgba(255, 77, 79, 0.3);
  animation: tc-critical-pulse 1.5s infinite;
}

.tc-shell-root.is-critical .tc-phase-bar__fill {
  background: #ff4d4f;
  animation: tc-bar-shake 0.2s infinite;
}

.tc-close {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* 애니메이션 정의 */
@keyframes tc-critical-pulse {
  0% { box-shadow: 0 0 8px rgba(255, 77, 79, 0.2); }
  50% { box-shadow: 0 0 16px rgba(255, 77, 79, 0.5); }
  100% { box-shadow: 0 0 8px rgba(255, 77, 79, 0.2); }
}

@keyframes tc-bar-shake {
  0% { transform: translateY(0); }
  50% { transform: translateY(-1px); }
  100% { transform: translateY(0); }
}
`;
