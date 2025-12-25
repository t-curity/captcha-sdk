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

.tc-toast {
  position: absolute;
  bottom: 40px;            /* 바닥에서 살짝 띄움 */
  left: 50%;               /* 가로 중앙 */
  transform: translateX(-50%); 
  
  background-color: rgba(33, 33, 33, 0.9); /* 차분한 검정 배경 */
  color: #fff;             /* 흰색 글씨 */
  padding: 10px 20px;      /* 넉넉한 여백 */
  border-radius: 20px;     /* 알약 모양 */
  
  font-size: 14px;         /* 너무 크지 않게 */
  z-index: 100;            /* 다른 요소 위에 */
  pointer-events: none;    /* 토스트 떠 있어도 뒤에 클릭 가능하게 (중요!) */
  
  /* 애니메이션 */
  opacity: 0;
  transition: opacity 0.3s ease;
}
`;
