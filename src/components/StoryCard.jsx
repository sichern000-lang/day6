import { Link } from 'react-router-dom'
import Sketch from './Sketch'
import { useAppStore } from '../store/useAppStore'
import { kindLabel, localize } from '../lib/stories'
import { useCursorPhoto } from '../lib/useCursorPhoto'

// 이야기 한 칸 — 썸네일(색연필 스케치) 아래 제목. 마우스를 올리면 장소 사진이 커서 옆에 떠오름
export default function StoryCard({ story, showSummary = false, ruled = false }) {
  const lang = useAppStore((s) => s.lang)
  const { handlers, photo } = useCursorPhoto(story, lang)
  const s = localize(story, lang)
  if (ruled) {
    // 이야기 목록용: 스케치를 가는 선으로 감싸고, ● 제목 아래에 종류·대표 키워드 알약
    const kw = s.keyword ?? s.place.split(' · ')[0]
    return (
      <>
        <Link to={`/stories/${story.id}`} className="story-card ruled" {...handlers}>
          <div className="art"><Sketch kind={story.kind} seed={story.id} /></div>
          <h3><i className="bullet" />{s.title}</h3>
          <p className="chips"><span className="chip-dark">{kindLabel(story.kind, lang)}</span>{kw && <span className="chip-dark">{kw}</span>}</p>
        </Link>
        {photo}
      </>
    )
  }
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
