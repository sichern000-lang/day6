// 로딩·에러·빈 결과 3종 — 데이터를 불러오는 모든 화면에서 공용으로 사용
export function Loading({ text = '불러오는 중…' }) {
  return <div className="status"><span className="spinner" />{text}</div>
}
export function ErrorBox({ error }) {
  if (!error) return null
  return <div className="status error" role="alert">⚠ {String(error)}</div>
}
export function Empty({ text = '결과가 없어요' }) {
  return <div className="status">{text}</div>
}
