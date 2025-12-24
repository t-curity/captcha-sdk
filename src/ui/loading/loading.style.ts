export const loadingCss = `
.tc-loading {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tc-loading-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.25);
  backdrop-filter: blur(4px);
}

.tc-loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
