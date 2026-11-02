import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FEATURED, localize } from '../lib/stories'
import { KEYWORD_IMAGES } from '../lib/keywordImages'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 대표 이야기 캐러셀 — 각 이야기의 대표 키워드 사물 사진을 보여 줌
export default function FeatureCarousel() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const track = useRef(null)
  const [index, setIndex] = useState(0)

  const target = useRef(0)     // 가려는 칸 번호 — 스크롤 애니메이션 도중에도 정확
  const busy = useRef(null)    // 코드로 스크롤하는 동안엔 onScroll 이 번호를 덮어쓰지 않게 함
  const slideWidth = () => track.current.children[0].offsetWidth + 16 // 카드 너비 + gap

  const go = (i) => {
    const next = Math.max(0, Math.min(FEATURED.length - 1, i))
    target.current = next
    setIndex(next)
    clearTimeout(busy.current)
    busy.current = setTimeout(() => { busy.current = null }, 700)
    track.current.scrollTo({ left: next * slideWidth(), behavior: 'smooth' })
  }
  // 손가락·휠로 직접 밀었을 때만 현재 위치 점을 맞춤
  const onScroll = () => {
    if (busy.current) return
    target.current = Math.round(track.current.scrollLeft / slideWidth())
    setIndex(target.current)
  }

  return (
    <div className="carousel">
      <div className="track" ref={track} onScroll={onScroll}>
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
      <div className="carousel-ctl">
        <button className="btn ghost small" onClick={() => go(target.current - 1)} disabled={index === 0} aria-label={t('home.prev')}>←</button>
        <div className="dots">
          {FEATURED.map((s, i) => (
            <button key={s.id} className={i === index ? 'on' : ''} onClick={() => go(i)} aria-label={`${i + 1}/${FEATURED.length}`} />
          ))}
        </div>
        <button className="btn ghost small" onClick={() => go(target.current + 1)} disabled={index === FEATURED.length - 1} aria-label={t('home.next')}>→</button>
      </div>
    </div>
  )
}
