import { useT } from '../lib/useT'

// 로딩·에러·빈 결과 3종 — 데이터를 불러오는 모든 화면에서 공용으로 사용
export function Loading({ text }) {
  const t = useT()
  return <div className="status"><span className="spinner" />{text ?? t('loading')}</div>
}
export function ErrorBox({ error }) {
  if (!error) return null
  return <div className="status error" role="alert">⚠ {String(error)}</div>
}
export function Empty({ text }) {
  const t = useT()
  return <div className="status">{text ?? t('empty')}</div>
}
