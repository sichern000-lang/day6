// 점검 스위치: true 면 화면은 점검 안내만 보이고 /api 는 503 으로 닫힘. 다시 열려면 false 로 바꿔 푸시.
// (Vercel 환경변수 VITE_MAINTENANCE=1 로도 같은 효과)
export const MAINTENANCE = false
