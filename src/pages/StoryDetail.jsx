import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import WeatherChip from '../components/WeatherChip'
import { Empty, ErrorBox, Loading } from '../components/Status'
import { fetchHeritage, fetchPlaces, fetchPlacesEn } from '../api/client'
import { getStoryById, kindLabel, localize } from '../lib/stories'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'
import NotFound from './NotFound'

const idle = { data: [], loading: true, error: '' }

export default function StoryDetail() {
  const t = useT()
  const { id } = useParams()
  const lang = useAppStore((s) => s.lang)
  const saveStory = useAppStore((s) => s.saveStory)
  const base = getStoryById(id)
  const story = localize(base, lang)
  const [places, setPlaces] = useState(idle)
  const [heritage, setHeritage] = useState(idle)

  useEffect(() => {
    if (!base) return
    let cancelled = false
    const run = (fn, keyword, set) => {
      set(idle)
      fn(keyword)
        .then((data) => !cancelled && set({ data, loading: false, error: '' }))
        .catch((e) => !cancelled && set({ data: [], loading: false, error: e.message }))
    }
    // 언어에 따라 국문/영문 관광정보 API 를 골라 호출 (유산은 국문만 제공)
    if (lang === 'en') run(fetchPlacesEn, base.tourKeywordEn, setPlaces)
    else run(fetchPlaces, base.tourKeyword, setPlaces)
    run(fetchHeritage, base.heritageKeyword, setHeritage)
    return () => { cancelled = true }
  }, [base, lang])

  if (!base) return <NotFound />

  return (
    <>
      <p className="hint"><Link to="/map">{t('detail.back')}</Link></p>
      <PageHeader title={story.title} subtitle={`${kindLabel(base.kind, lang)} · ${story.place}`} />
      <div className="row"><WeatherChip place={base.region} /></div>

      <div className="panel story-text">
        <p>{story.story}</p>
        <p className="hint">{t('detail.note')}</p>
        <button className="btn" onClick={() => saveStory({ id: base.id, title: story.title })}>{t('detail.save')}</button>
      </div>

      <div className="grid two">
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
          <ul className="list">
            {heritage.data.map((h, i) => (
              <li key={i}><div><strong>{h.name}</strong><span>{h.kind} · {h.city}</span></div></li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
