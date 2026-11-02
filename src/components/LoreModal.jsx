import { useEffect, useState } from 'react'
import Modal from './Modal'
import { Empty, ErrorBox, Loading } from './Status'
import { fetchPlaces } from '../api/client'
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

      <h3 className="modal-label places-title">
        {t('detail.places')} <small>{t('detail.placesSrc')}{state.used && ` · “${state.used}”`}</small>
      </h3>
      {state.loading && <Loading />}
      <ErrorBox error={state.error} />
      {!state.loading && !state.error && shown.length === 0 && <Empty text={t('detail.noPlaces')} />}
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
