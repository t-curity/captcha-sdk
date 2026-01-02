export const toastCss = `
.tc-toast {
  position: absolute;
  bottom: 24px;
  left: 50%;

  transform: translate(-50%, 10px); 
  opacity: 0;
  visibility: hidden;

  background: #111827;
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  
  font-size: 14px;
  font-weight: 500;
  z-index: 100;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  
  transition: 
    opacity 0.2s ease, 
    transform 0.2s ease, 
    visibility 0.2s;
}
.tc-toast.show {
  transform: translate(-50%, 0);
  opacity: 1;
  visibility: visible;
}
`;
