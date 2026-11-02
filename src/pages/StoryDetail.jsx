import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MountainWash from '../components/MountainWash'
import { Empty, ErrorBox, Loading } from '../components/Status'
import { fetchHeritage, fetchPlaces, fetchPlacesEn } from '../api/client'
import { getStoryById, kindLabel, localize, tourKeywordEn } from '../lib/stories'
import { isKo } from '../lib/langs'
import { copyText } from '../lib/copy'
import { useTranslated } from '../lib/useTranslated'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'
import NotFound from './NotFound'

const idle = { data: [], loading: true, error: '' }

export default function StoryDetail() {
  const t = useT()
  const { id } = useParams()
  const lang = useAppStore((s) => s.lang)
  const saved = useAppStore((s) => s.saved)
  const loadSaved = useAppStore((s) => s.loadSaved)
  const saveStory = useAppStore((s) => s.saveStory)
  const toast = useAppStore((s) => s.toast)
  const base = getStoryById(id)
  const story = localize(base, lang)
  const [places, setPlaces] = useState(idle)
  const [heritage, setHeritage] = useState(idle)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => { loadSaved() }, [loadSaved])

  // 이 페이지에서만 배경을 더 밝게
  useEffect(() => {
    document.body.classList.add('bright')
    return () => document.body.classList.remove('bright')
  }, [])

  useEffect(() => {
    if (!base) return
    let cancelled = false
    const run = (fn, keyword, set) => {
      set(idle)
      fn(keyword)
        .then((data) => !cancelled && set({ data, loading: false, error: '' }))
        .catch((e) => !cancelled && set({ data: [], loading: false, error: e.message }))
    }
    // 언어에 따라 국문/영문 관광정보 API 를 골라 호출 (유산은 국문만 제공 → 영어 모드에서는 번역해서 보여줌)
    if (!isKo(lang)) run(fetchPlacesEn, tourKeywordEn(base), setPlaces)
    else run(fetchPlaces, base.tourKeyword, setPlaces)
    run(fetchHeritage, base.heritageKeyword, setHeritage)
    return () => { cancelled = true }
  }, [base, lang])

  const tr = useTranslated(heritage.data.flatMap((h) => [h.name, h.kind, h.city]), !isKo(lang))

  if (!base) return <NotFound />

  const isSaved = saved.some((s) => s.story_id === base.id)
  const meta = `${kindLabel(base.kind, lang)} · ${story.place}`.split(' · ')

  async function copyAddress(id, addr) {
    if (!(await copyText(addr))) return toast(t('toast.copyfail'), 'error')
    toast(t('toast.copied'))
    setCopiedId(id)
    setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500)
  }

  return (
    <>
      <div className="detail-top">
        <MountainWash className="wash-top" />
        <Link to="/map" className="back">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M16 10H4m5-5-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {t('detail.back')}
        </Link>
        <h1>{story.title}</h1>
        <p className="detail-meta">
          {meta.map((m, i) => <span key={i}>{m}</span>)}
        </p>
      </div>

      <div className="story-panel">
        <p className="story-body">{story.story}</p>
        <p className="hint">{t('detail.note')}</p>
        <div className="row">
          <button className="btn dark" onClick={() => saveStory({ id: base.id, title: story.title })}>
            <span aria-hidden="true">＋</span> {t('detail.save').replace('＋ ', '')}
          </button>
          <Link to="/notebook" className={`icon-btn ${isSaved ? 'on' : ''}`} aria-label={t('nav.notebook')}>
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M5.5 3h9v14L10 13.5 5.5 17Z" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </Link>
        </div>
      </div>

      <div className="grid two detail-lists">
        <section>
          <h2 className="section-title">{t('detail.places')} <small>{t('detail.placesSrc')}</small></h2>
          {places.loading && <Loading />}
          <ErrorBox error={places.error} />
          {!places.loading && !places.error && places.data.length === 0 && <Empty text={t('detail.noPlaces')} />}
          <ul className="rows">
            {places.data.map((p) => (
              <li key={p.id}>
                <div className="row-item">
                  {p.image && <img src={p.image} alt="" loading="lazy" />}
                  <span className="h-text"><strong>{p.title}</strong><span>{p.addr}</span></span>
                  {p.addr && (
                    <button className="copy-btn" onClick={() => copyAddress(p.id, p.addr)}
                      aria-label={t('detail.copy')} title={t('detail.copy')}>
                      {copiedId === p.id ? (
                        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ) : (
                        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><rect x="7" y="7" width="9" height="9" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M13 7V5.5A1.5 1.5 0 0 0 11.5 4h-6A1.5 1.5 0 0 0 4 5.5v6A1.5 1.5 0 0 0 5.5 13H7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                      )}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="section-title">{t('detail.heritage')} <small>{t('detail.heritageSrc')}</small></h2>
          {heritage.loading && <Loading />}
          <ErrorBox error={heritage.error} />
          {!heritage.loading && !heritage.error && heritage.data.length === 0 && <Empty text={t('detail.noHeritage')} />}
          <ul className="rows">
            {heritage.data.map((h, i) => (
              <li key={i}>
                <a href={`https://www.google.com/search?q=${encodeURIComponent(h.name)}`} target="_blank" rel="noopener noreferrer">
                  <span className="h-text">
                    <strong>{tr(h.name) ?? h.name}{tr(h.name) && <small> {h.name}</small>}</strong>
                    <span>{[tr(h.kind) ?? h.kind, tr(h.city) ?? h.city].filter(Boolean).join(' · ')}</span>
                  </span>
                  <span className="h-arrow" aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
          {t('detail.heritageNote') && <p className="hint">{t('detail.heritageNote')}</p>}
        </section>
      </div>
    </>
  )
}
