import { Link } from 'react-router-dom'
import KindArt, { toneOf } from './KindArt'
import { useAppStore } from '../store/useAppStore'
import { kindLabel, localize } from '../lib/stories'

// 이야기 한 칸 — 홈·목록·지도 선택 패널에서 재사용
export default function StoryCard({ story, showSummary = false }) {
  const lang = useAppStore((s) => s.lang)
  const s = localize(story, lang)
  return (
    <Link to={`/stories/${story.id}`} className="story-card">
      <div className={`art ${toneOf(story.kind)}`}><KindArt kind={story.kind} /></div>
      <h3>{s.title}</h3>
      <p className="meta">{kindLabel(story.kind, lang)} · {s.place}</p>
      {showSummary && <p className="sum">{s.summary}</p>}
    </Link>
  )
}
