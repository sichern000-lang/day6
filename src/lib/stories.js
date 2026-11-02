import stories from '../data/stories.json'

export const STORIES = stories
export const KINDS = ['전체', ...new Set(stories.map((s) => s.kind))]
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
