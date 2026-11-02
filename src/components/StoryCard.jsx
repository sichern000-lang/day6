import { Link } from 'react-router-dom'
import KindArt, { toneOf } from './KindArt'

// 이야기 한 칸 — 홈·목록·지도 선택 패널에서 재사용
export default function StoryCard({ story, showSummary = false }) {
  return (
    <Link to={`/stories/${story.id}`} className="story-card">
      <div className={`art ${toneOf(story.kind)}`}><KindArt kind={story.kind} /></div>
      <h3>{story.title}</h3>
      <p className="meta">{story.kind} · {story.place}</p>
      {showSummary && <p className="sum">{story.summary}</p>}
    </Link>
  )
}
