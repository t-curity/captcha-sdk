export const overlayCss = `
.tc-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tc-overlay-capture {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);

  touch-action: none;
  pointer-events: auto;
}

.tc-overlay-stage {
  position: relative;
  z-index: 1;
  display: flex;
}
`;
