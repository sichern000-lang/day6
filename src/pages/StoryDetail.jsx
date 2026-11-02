import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import WeatherChip from '../components/WeatherChip'
import { Empty, ErrorBox, Loading } from '../components/Status'
import { fetchHeritage, fetchPlaces } from '../api/client'
import { getStoryById } from '../lib/stories'
import { useAppStore } from '../store/useAppStore'
import NotFound from './NotFound'

const idle = { data: [], loading: true, error: '' }

export default function StoryDetail() {
  const { id } = useParams()
  const story = getStoryById(id)
  const saveStory = useAppStore((s) => s.saveStory)
  const [places, setPlaces] = useState(idle)
  const [heritage, setHeritage] = useState(idle)

  useEffect(() => {
    if (!story) return
    let cancelled = false
    const run = (fn, keyword, set) => {
      set(idle)
      fn(keyword)
        .then((data) => !cancelled && set({ data, loading: false, error: '' }))
        .catch((e) => !cancelled && set({ data: [], loading: false, error: e.message }))
    }
    run(fetchPlaces, story.tourKeyword, setPlaces)
    run(fetchHeritage, story.heritageKeyword, setHeritage)
    return () => { cancelled = true }
  }, [story])

  if (!story) return <NotFound />

  return (
    <>
      <p className="hint"><Link to="/map">← 지도로</Link></p>
      <PageHeader title={story.title} subtitle={`${story.kind} · ${story.place}`} />
      <div className="row"><WeatherChip place={story.region} /></div>

      <div className="panel story-text">
        <p>{story.story}</p>
        <p className="hint">신화는 전승에 따라 내용이 조금씩 달라요.</p>
        <button className="btn" onClick={() => saveStory(story)}>＋ 내 수첩에 담기</button>
      </div>

      <div className="grid two">
        <section>
          <h2 className="section-title">이야기의 무대 <small>한국관광공사</small></h2>
          {places.loading && <Loading />}
          <ErrorBox error={places.error} />
          {!places.loading && !places.error && places.data.length === 0 && <Empty text="관련 장소가 없어요" />}
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
          <h2 className="section-title">국가유산 <small>국가유산청</small></h2>
          {heritage.loading && <Loading />}
          <ErrorBox error={heritage.error} />
          {!heritage.loading && !heritage.error && heritage.data.length === 0 && <Empty text="관련 유산이 없어요" />}
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
