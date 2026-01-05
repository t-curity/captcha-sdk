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
  background: rgba(255,255,255,0.25);
  backdrop-filter: blur(4px);
}

.tc-loading-spinner {
  position: relative;
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
