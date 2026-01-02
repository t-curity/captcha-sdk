export const overlayCss = `
.tc-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.tc-overlay-capture {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  pointer-events: none;
}

.tc-overlay-stage {
  position: relative;
  z-index: 1;
  display: flex;

  pointer-events: auto;
}
`;
