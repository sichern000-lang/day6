import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MountainWash from '../components/MountainWash'
import { Empty, ErrorBox, Loading } from '../components/Status'
import { fetchHeritage, fetchPlaces, fetchPlacesEn } from '../api/client'
import { getStoryById, kindLabel, localize } from '../lib/stories'
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

  useEffect(() => { loadSaved() }, [loadSaved])

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
    if (lang === 'en') run(fetchPlacesEn, base.tourKeywordEn, setPlaces)
    else run(fetchPlaces, base.tourKeyword, setPlaces)
    run(fetchHeritage, base.heritageKeyword, setHeritage)
    return () => { cancelled = true }
  }, [base, lang])

  const tr = useTranslated(heritage.data.flatMap((h) => [h.name, h.kind, h.city]), lang === 'en')

  if (!base) return <NotFound />

  const isSaved = saved.some((s) => s.story_id === base.id)
  const meta = `${kindLabel(base.kind, lang)} · ${story.place}`.split(' · ')

  // 클립보드 API 가 막힌 환경(권한·http)에서는 임시 입력창으로 복사를 다시 시도
  async function copyAddress(addr) {
    try {
      await navigator.clipboard.writeText(addr)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = addr
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      if (!ok) return toast(t('toast.copyfail'), 'error')
    }
    toast(t('toast.copied'))
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
        <MountainWash className="wash-card" />
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
          <ul className="list">
            {places.data.map((p) => (
              <li key={p.id}>
                {p.image && <img src={p.image} alt="" loading="lazy" />}
                <div><strong>{p.title}</strong><span>{p.addr}</span></div>
                {p.addr && (
                  <button className="btn ghost small" onClick={() => copyAddress(p.addr)}>{t('detail.copy')}</button>
                )}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="section-title">{t('detail.heritage')} <small>{t('detail.heritageSrc')}</small></h2>
          {t('detail.heritageNote') && <p className="hint">{t('detail.heritageNote')}</p>}
          {heritage.loading && <Loading />}
          <ErrorBox error={heritage.error} />
          {!heritage.loading && !heritage.error && heritage.data.length === 0 && <Empty text={t('detail.noHeritage')} />}
          <ul className="heritage">
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
        </section>
      </div>
    </>
  )
}
