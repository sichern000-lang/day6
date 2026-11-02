import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sketch from './Sketch'
import { useAppStore } from '../store/useAppStore'
import { kindLabel, localize } from '../lib/stories'
import { usePlaceImage } from '../lib/placeImage'

// 글 칸(● 제목 + ↘ 항목)과 스케치 칸이 바둑판처럼 번갈아 놓이는 목록.
// 이야기마다 글 칸 + 스케치 칸 한 쌍 — 어느 쪽에 마우스를 올려도 스케치 칸에 장소 사진이 떠오름
function Pair({ story, lang }) {
  const [hover, setHover] = useState(false)
  const photo = usePlaceImage(story, lang, hover)
  const v = localize(story, lang)
  const to = `/stories/${story.id}`
  const on = { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) }
  return (
    <>
      <Link to={to} className="cell text" {...on}>
        <p className="cell-title"><i className="bullet" />{v.title}</p>
        <ul>
          <li>{kindLabel(story.kind, lang)}</li>
          <li>{v.place}</li>
          {(v.keyword ?? story.keyword) && <li>{v.keyword ?? story.keyword}</li>}
        </ul>
      </Link>
      <Link to={to} className="cell art-cell" aria-hidden="true" tabIndex={-1} {...on}>
        <Sketch kind={story.kind} seed={story.id} />
        {photo && <img className={`place-photo ${hover ? 'on' : ''}`} src={photo} alt="" />}
      </Link>
    </>
  )
}

export default function FeaturedGrid({ stories }) {
  const lang = useAppStore((s) => s.lang)
  return (
    <div className="sketch-grid">
      {stories.map((s) => <Pair key={s.id} story={s} lang={lang} />)}
    </div>
  )
}
