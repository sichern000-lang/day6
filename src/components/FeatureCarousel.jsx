import { Link } from 'react-router-dom'
import { FEATURED, localize } from '../lib/stories'
import { KEYWORD_IMAGES } from '../lib/keywordImages'
import { useAppStore } from '../store/useAppStore'

// 대표 이야기 — 각 이야기의 대표 키워드 사물 사진. 좁은 화면에서는 옆으로 밀어서 봄
export default function FeatureCarousel() {
  const lang = useAppStore((s) => s.lang)
  return (
    <div className="track">
      {FEATURED.map((s) => {
        const v = localize(s, lang)
        return (
          <Link key={s.id} to={`/stories/${s.id}`} className="slide">
            <div className="photo">
              <img src={KEYWORD_IMAGES[s.image]} alt={v.keyword ?? s.keyword} loading="lazy" />
              <span className="chip">{v.keyword ?? s.keyword}</span>
            </div>
            <h3>{v.title}</h3>
            <p className="meta">{v.place}</p>
          </Link>
        )
      })}
    </div>
  )
}
