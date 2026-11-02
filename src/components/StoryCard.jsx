import { Link } from 'react-router-dom'
import Sketch from './Sketch'
import { useAppStore } from '../store/useAppStore'
import { kindLabel, localize } from '../lib/stories'
import { useCursorPhoto } from '../lib/useCursorPhoto'

// 이야기 한 칸 — 썸네일(색연필 스케치) 아래 제목. 마우스를 올리면 장소 사진이 커서 옆에 떠오름
export default function StoryCard({ story, showSummary = false }) {
  const lang = useAppStore((s) => s.lang)
  const { handlers, photo } = useCursorPhoto(story, lang)
  const s = localize(story, lang)
  return (
    <>
      <Link to={`/stories/${story.id}`} className="story-card" {...handlers}>
        <div className="art"><Sketch kind={story.kind} seed={story.id} /></div>
        <h3>{s.title}</h3>
        <p className="meta">{kindLabel(story.kind, lang)} · {s.place}</p>
        {showSummary && <p className="sum">{s.summary}</p>}
      </Link>
      {photo}
    </>
  )
}
