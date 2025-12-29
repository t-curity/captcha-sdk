export const toastCss = `
.tc-toast {
  position: absolute;
  bottom: 40px;            /* 바닥에서 살짝 띄움 */
  left: 50%;               /* 가로 중앙 */

  transform: translate(-50%, 20px); 
  opacity: 0;
  visibility: hidden;

  background-color: rgba(33, 33, 33, 0.9); /* 차분한 검정 배경 */
  color: #fff;             /* 흰색 글씨 */
  padding: 10px 20px;      /* 넉넉한 여백 */
  border-radius: 20px;     /* 알약 모양 */
  
  font-size: 14px;         /* 너무 크지 않게 */
  z-index: 100;            /* 다른 요소 위에 */
  pointer-events: none;    /* 토스트 떠 있어도 뒤에 클릭 가능하게 (중요!) */
  
  /* 애니메이션 */
  transition: 
    opacity 0.3s ease, 
    transform 0.3s ease, 
    visibility 0.3s;
}
.tc-toast.show {
  /* 살짝 위로 올라오는 효과 (기존 translateX(-50%)와 결합) */
  transform: translate(-50%, 0);
  opacity: 1;
  visibility: visible;
}
`;
