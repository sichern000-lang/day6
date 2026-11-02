import { useEffect, useState } from 'react'
import Modal from './Modal'
import { ErrorBox, Loading } from './Status'
import { fetchPlaces, summarizeLore } from '../api/client'
import { GROUP, label } from '../lib/folk'
import { copyText } from '../lib/copy'
import { isKo } from '../lib/langs'
import { useTranslated } from '../lib/useTranslated'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

const plain = (s) => s.replace(/\(.*?\)/g, '').trim() // "도체비(도깨비)" → "도체비"
// 자동 검색에서는 뜻이 너무 흔한 핵심어를 뺌 (직접 눌러서 검색하는 건 가능)
const GENERIC = new Set(['본풀이', '본', '사람', '사름', '하르방', '할망', '할아버지', '할머니', '아기', '각시'])

// 신화·민담 한 편을 모달로 — 이야기 저장, 핵심어로 관련 장소 찾기 (외부 사이트로 나가지 않음)
export default function LoreModal({ item, titleLocal, onClose, onSearch }) {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const saved = useAppStore((s) => s.saved)
  const saveStory = useAppStore((s) => s.saveStory)
  const toast = useAppStore((s) => s.toast)
  const isSaved = saved.some((s) => s.story_id === item.id)
  const translated = !isKo(lang)

  // 제목 → 핵심어 순서로 장소가 나올 때까지 찾아봄. 핵심어를 누르면 그 낱말로 다시 검색
  const candidates = [...new Set([plain(item.title), ...item.tags.map(plain)])]
    .filter((k) => k.length >= 2 && !GENERIC.has(k)).slice(0, 4)
  const [picked, setPicked] = useState(null)
  const [state, setState] = useState({ list: [], loading: true, error: '', used: '' })

  useEffect(() => {
    let alive = true
    setState({ list: [], loading: true, error: '', used: '' })
    ;(async () => {
      try {
        for (const kw of picked ? [picked] : candidates) {
          const list = await fetchPlaces(kw)
          if (!alive) return
          if (list.length) return setState({ list, loading: false, error: '', used: kw })
        }
        if (alive) setState({ list: [], loading: false, error: '', used: picked ?? '' })
      } catch (e) {
        if (alive) setState({ list: [], loading: false, error: e.message, used: '' })
      }
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, picked])

  // 이야기 요약: 도청 데이터에는 본문이 없어서 Gemini 가 Google 검색으로 찾은 내용을 요약함 (같은 이야기·언어는 한 번만 요청)
  const [sum, setSum] = useState({ text: '', sources: [], loading: true, error: false })
  useEffect(() => {
    const key = `sinhwa-sum2|${lang}|${item.id}`
    let cached = null
    try { cached = JSON.parse(sessionStorage.getItem(key)) } catch { /* 저장소를 못 써도 동작에는 지장 없음 */ }
    if (cached) return setSum({ ...cached, loading: false, error: false })
    let alive = true
    setSum({ text: '', sources: [], loading: true, error: false })
    summarizeLore(item, lang)
      .then(({ summary, sources }) => {
        try { sessionStorage.setItem(key, JSON.stringify({ text: summary, sources })) } catch { /* 위와 같음 */ }
        if (alive) setSum({ text: summary, sources, loading: false, error: false })
      })
      .catch(() => alive && setSum({ text: '', sources: [], loading: false, error: true }))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, lang])

  const shown = state.list.slice(0, 6)
  const tr = useTranslated(shown.map((p) => p.title), translated)

  async function copy(addr) {
    const ok = await copyText(addr)
    toast(ok ? t('toast.copied') : t('toast.copyfail'), ok ? undefined : 'error')
  }

  return (
    <Modal onClose={onClose} label={item.title}>
      <span className="lore-kind">{label(GROUP[item.group], lang)}</span>
      <h2 className="modal-title">{titleLocal ?? item.title}</h2>
      {titleLocal && <p className="modal-sub">{item.title}</p>}

      <div className="modal-block lore-summary">
        <b className="modal-label">{t('modal.summary')} <i className="ai-tag">AI</i></b>
        {sum.loading && <Loading />}
        {sum.text && <p className="lore-summary-text">{sum.text}</p>}
        {sum.error && <p className="hint">{t('modal.summaryFail')}</p>}
        {sum.sources.length > 0 && (
          <p className="lore-sources">{t('modal.sources')}: {sum.sources.map((src, i) => (
            <a key={i} href={src.url} target="_blank" rel="noopener noreferrer">{src.title}</a>
          ))}</p>
        )}
        {sum.text && <p className="hint">{t('modal.summaryNote')}</p>}
      </div>

      {item.tags.length > 0 && (
        <div className="modal-block">
          <b className="modal-label">{t('modal.tags')}</b>
          <div className="modal-tags">
            {item.tags.map((tag) => (
              <button key={tag} className={`tag ${picked === plain(tag) ? 'on' : ''}`}
                onClick={() => setPicked(picked === plain(tag) ? null : plain(tag))}>{tag}</button>
            ))}
          </div>
          <p className="hint">{t('modal.tagHint')}</p>
        </div>
      )}

      <div className="modal-actions">
        <button className="btn dark" disabled={isSaved} onClick={() => saveStory({ id: item.id, title: item.title })}>
          {isSaved ? `✓ ${t('modal.saved')}` : `+ ${t('detail.save').replace('＋ ', '')}`}
        </button>
        <button className="btn ghost" onClick={() => { onSearch(plain(item.title)); onClose() }}>{t('modal.findSame')}</button>
        {/* 도청의 원문 PDF·전자책 주소는 모두 열리지 않아서, 제목으로 웹 검색을 열어 줌 */}
        <a className="btn ghost" href={`https://www.google.com/search?q=${encodeURIComponent(`제주 ${item.kind === 'myth' ? '신화' : '민담'} ${plain(item.title)}`)}`}
          target="_blank" rel="noopener noreferrer" title={t('modal.sourceHint')}>{t('modal.source')} ↗</a>
      </div>

      {(state.loading || state.error || shown.length > 0) && (
        <h3 className="modal-label places-title">
          {t('detail.places')} <small>{t('detail.placesSrc')}{state.used && ` · “${state.used}”`}</small>
        </h3>
      )}
      {state.loading && <Loading />}
      <ErrorBox error={state.error} />
      <ul className="rows">
        {shown.map((p) => (
          <li key={p.id}>
            <div className="row-item">
              {p.image && <img src={p.image} alt="" loading="lazy" />}
              <span className="h-text">
                <strong>{tr(p.title) ?? p.title}{tr(p.title) && <small> {p.title}</small>}</strong>
                <span>{p.addr}</span>
              </span>
              {p.addr && (
                <button className="copy-btn" onClick={() => copy(p.addr)} aria-label={t('detail.copy')} title={t('detail.copy')}>
                  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><rect x="7" y="7" width="9" height="9" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M13 7V5.5A1.5 1.5 0 0 0 11.5 4h-6A1.5 1.5 0 0 0 4 5.5v6A1.5 1.5 0 0 0 5.5 13H7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
