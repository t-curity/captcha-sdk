export const phaseACss = `
.tc-phase-a {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
}

.tc-phase-a-slot {
  position: relative;

  touch-action: none;
  user-select: none;
}

.tc-phase-a-slot img {
  display: block;
  max-width: 480px;

  pointer-events: none;
  -webkit-user-drag: none;
  user-select: none;
}
  
.tc-guide-band {
  position: absolute;
  box-sizing: border-box;
  border: 1px dashed red;
  pointer-events: none;
  transform-origin: 0 50%
}
  
.tc-guide-center {
  position: absolute;
  box-sizing: border-box;
  border-top: 1px solid green;
  pointer-events: none;
  transform-origin: 0 50%;
}

.tc-guide-text {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}
`;
