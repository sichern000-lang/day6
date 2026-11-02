import { useEffect, useState } from 'react'
import { Empty, ErrorBox, Loading } from './Status'
import { fetchPlaces, fetchPlacesEn } from '../api/client'
import { STORIES, tourKeywordEn } from '../lib/stories'
import { isKo } from '../lib/langs'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 다녀온 장소 고르기 — 이야기 속 장소 버튼 또는 이름 검색 (한국관광공사 API)
export default function PlacePicker({ value, onPick }) {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const en = !isKo(lang) // 한국어 외에는 영문 관광정보(영어 검색어)를 씀
  const [q, setQ] = useState('')
  const [keyword, setKeyword] = useState('')           // 실제로 검색 중인 낱말 (입력이 멈추면 반영)
  const [state, setState] = useState({ list: [], loading: false, error: '' })

  useEffect(() => {
    const id = setTimeout(() => setKeyword(q.trim()), 400)  // 타자를 멈춘 뒤에만 검색
    return () => clearTimeout(id)
  }, [q])

  useEffect(() => {
    if (!keyword) return setState({ list: [], loading: false, error: '' })
    let alive = true
    setState((s) => ({ ...s, loading: true, error: '' }))
    ;(en ? fetchPlacesEn : fetchPlaces)(keyword)
      .then((list) => alive && setState({ list, loading: false, error: '' }))
      .catch((e) => alive && setState({ list: [], loading: false, error: e.message }))
    return () => { alive = false }
  }, [keyword, en])

  if (value) {
    return (
      <div className="picked">
        {value.image && <img src={value.image} alt="" />}
        <span className="h-text">
          <strong>{value.title}</strong>
          <span>{value.addr}</span>
        </span>
        <button type="button" className="btn ghost small" onClick={() => onPick(null)}>{t('review.change')}</button>
      </div>
    )
  }

  return (
    <div className="picker">
      <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('review.searchPlace')} />
      <p className="modal-label quick-label">{t('review.quick')}</p>
      <div className="modal-tags">
        {STORIES.map((s) => {
          const kw = en ? tourKeywordEn(s) : s.tourKeyword
          return <button key={s.id} type="button" className={`tag ${keyword === kw ? 'on' : ''}`} onClick={() => { setQ(kw); setKeyword(kw) }}>{kw}</button>
        })}
      </div>
      {state.loading && <Loading />}
      <ErrorBox error={state.error} />
      {keyword && !state.loading && !state.error && state.list.length === 0 && <Empty text={t('review.noResult')} />}
      <ul className="rows pick-list">
        {state.list.map((p) => (
          <li key={p.id}>
            <button type="button" className="row-item pick" onClick={() => onPick(p)}>
              {p.image && <img src={p.image} alt="" loading="lazy" />}
              <span className="h-text"><strong>{p.title}</strong><span>{p.addr}</span></span>
              <span className="h-arrow" aria-hidden="true">＋</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
