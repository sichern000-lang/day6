import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sketch from './Sketch'
import { useAppStore } from '../store/useAppStore'
import { kindLabel, localize } from '../lib/stories'
import { usePlaceImage } from '../lib/placeImage'

// 이야기 한 칸 — 지도 선택 패널 등에서 사용. 색연필 스케치 썸네일, 호버하면 장소 사진
export default function StoryCard({ story, showSummary = false }) {
  const lang = useAppStore((s) => s.lang)
  const [hover, setHover] = useState(false)
  const photo = usePlaceImage(story, lang, hover)
  const s = localize(story, lang)
  return (
    <Link to={`/stories/${story.id}`} className="story-card"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="art">
        <Sketch kind={story.kind} seed={story.id} />
        {photo && <img className={`place-photo ${hover ? 'on' : ''}`} src={photo} alt="" />}
      </div>
      <h3>{s.title}</h3>
      <p className="meta">{kindLabel(story.kind, lang)} · {s.place}</p>
      {showSummary && <p className="sum">{s.summary}</p>}
    </Link>
  )
}
