import stories from '../data/stories.json'

export const STORIES = stories
export const KINDS = ['전체', ...new Set(stories.map((s) => s.kind))]
export const KIND_EN = {
  전체: 'All', 창조신화: 'Creation myth', 건국신화: 'Founding myth',
  지형전설: 'Landscape legend', 마을전설: 'Village legend', 당신화: 'Shrine myth',
}
export const kindLabel = (kind, lang) => (lang === 'en' ? KIND_EN[kind] ?? kind : kind)

// 화면에 보여줄 언어로 이야기 문구를 골라 줌 (id·kind·region·좌표는 그대로)
export function localize(s, lang) {
  if (!s) return s
  if (lang !== 'en') return s
  return {
    ...s,
    title: s.titleEn, place: s.placeEn, summary: s.summaryEn, story: s.storyEn,
    keyword: s.keywordEn, tourKeyword: s.tourKeywordEn,
  }
}

// 메인에 올리는 대표 이야기 — 대표 키워드(사물)가 있는 이야기
export const FEATURED = stories.filter((s) => s.image)

export const getStoryById = (id) => stories.find((s) => s.id === id)

// 오늘의 이야기 — 날짜로 고정
export function storyOfTheDay(date = new Date()) {
  return stories[Math.floor(date.getTime() / 86400000) % stories.length]
}

// 지도 투영: 제주도 대략 범위(위경도)를 SVG 좌표로
const LNG = [126.12, 127.0], LAT = [33.1, 33.6]
export const MAP_W = 800, MAP_H = 360
export const project = (lat, lng) => ({
  x: ((lng - LNG[0]) / (LNG[1] - LNG[0])) * MAP_W,
  y: (1 - (lat - LAT[0]) / (LAT[1] - LAT[0])) * MAP_H,
})
