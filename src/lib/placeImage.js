import { useEffect, useState } from 'react'
import { fetchPlaces, fetchPlacesEn } from '../api/client'

// 이야기의 무대(관광공사 API)에서 첫 번째 사진 한 장 — 호버했을 때 처음 한 번만 불러오고 기억해 둠
const cache = new Map() // `${lang}:${keyword}` → url | null
const pending = new Map()

// 관광공사 사진 주소는 http 로 올 때가 있어서 https 페이지에서 막히지 않게 바꿈
const secure = (u) => u.replace(/^http:\/\/(tong\.visitkorea\.or\.kr)/, 'https://$1')

function load(story, lang) {
  const en = lang === 'en'
  const keyword = en ? story.tourKeywordEn : story.tourKeyword
  const key = `${lang}:${keyword}`
  if (cache.has(key)) return Promise.resolve(cache.get(key))
  if (!pending.has(key)) {
    pending.set(key, (en ? fetchPlacesEn : fetchPlaces)(keyword)
      .then((list) => list.find((p) => p.image)?.image ?? null)
      .then((u) => (u ? secure(u) : null))
      .catch(() => null) // 못 가져오면 그냥 스케치만 보여줌
      .then((u) => { cache.set(key, u); pending.delete(key); return u }))
  }
  return pending.get(key)
}

// active(호버 중) 가 되면 사진을 찾아서 돌려줌. 없으면 null
export function usePlaceImage(story, lang, active) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    if (!active) return
    let alive = true
    load(story, lang).then((u) => alive && setUrl(u))
    return () => { alive = false }
  }, [story, lang, active])
  return url
}
