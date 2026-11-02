// 신화·전설 데이터 (src/data/stories.json) 검색 — 에이전트 도구가 사용합니다
import stories from '../src/data/stories.json' with { type: 'json' }

export function getStory({ keyword = '' } = {}) {
  const k = keyword.trim()
  const hit = !k ? stories : stories.filter((s) =>
    [s.title, s.kind, s.place, s.summary, s.story].some((t) => t.includes(k)))
  return hit.map(({ id, title, kind, place, region, story, tourKeyword }) => ({ id, title, kind, place, region, story, tourKeyword }))
}
