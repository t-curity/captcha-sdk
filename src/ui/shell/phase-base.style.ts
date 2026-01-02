export const phaseBaseCss = `
.tc-phase {
  background: #fff;
  border-radius: 28px;
  padding: 20px 24px;
  box-sizing: border-box;
  box-shadow: 0 24px 64px rgba(0,0,0,0.2);
  max-width: 420px;
  width: 100%;
}

.tc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tc-header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tc-header-step {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.5px;
}

.tc-header-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
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
  height: 4px;
  border-radius: 2px;
  background: #f3f4f6;
  overflow: hidden;
}

.tc-phase-bar__fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #6366f1, #818cf8);
  border-radius: 2px;
  transition: width 100ms linear;
}

.tc-shell-root.is-critical .tc-phase-bar__fill {
  background: linear-gradient(90deg, #f43f5e, #fb7185);
}

.tc-close {
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.tc-close:hover {
  background: #e5e7eb;
  color: #374151;
}
`;
