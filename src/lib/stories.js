import stories from '../data/stories.json'
import i18n from '../data/stories-i18n.json'

export const STORIES = stories
export const KINDS = ['전체', ...new Set(stories.map((s) => s.kind))]

// 이야기 종류 이름 (한국어는 원래 값 그대로)
export const KIND_LABEL = {
  en: { 전체: 'All', 창조신화: 'Creation myth', 건국신화: 'Founding myth', 지형전설: 'Landscape legend', 마을전설: 'Village legend', 당신화: 'Shrine myth' },
  es: { 전체: 'Todas', 창조신화: 'Mito de la creación', 건국신화: 'Mito fundacional', 지형전설: 'Leyenda del paisaje', 마을전설: 'Leyenda de aldea', 당신화: 'Mito de santuario' },
  de: { 전체: 'Alle', 창조신화: 'Schöpfungsmythos', 건국신화: 'Gründungsmythos', 지형전설: 'Landschaftslegende', 마을전설: 'Dorflegende', 당신화: 'Schreinmythos' },
}
export const kindLabel = (kind, lang) => (lang === 'ko' ? kind : KIND_LABEL[lang]?.[kind] ?? KIND_LABEL.en[kind] ?? kind)

// 한국관광공사 영문 관광정보를 찾을 때 쓰는 영어 검색어 (영어·스페인어·독일어 화면 모두 영문 서비스를 씀)
export const tourKeywordEn = (story) => i18n.en[story.id]?.tourKeyword ?? story.tourKeyword

// 화면에 보여줄 언어로 이야기 문구를 골라 줌 (id·kind·region·좌표는 그대로). 번역이 없으면 영어로 대신
export function localize(s, lang) {
  if (!s || lang === 'ko') return s
  const tx = i18n[lang]?.[s.id] ?? i18n.en[s.id]
  return { ...s, ...tx, tourKeyword: tourKeywordEn(s) }
}

export const getStoryById = (id) => stories.find((s) => s.id === id)

// 메인에 올리는 대표 이야기 — 대표 키워드(사물)가 있는 이야기
export const FEATURED = stories.filter((s) => s.image)

// 지도 투영: 제주도 위경도를 지도 SVG(jeju-map.svg, 원본 1775×886) 좌표로 — 지도 속 섬 그림이 차지하는 범위(87~1658, 118~773)에 위경도 범위를 맞춤
const LNG = [126.15, 126.97], LAT = [33.11, 33.56]
const K = 800 / 1775
export const MAP_W = 800, MAP_H = Math.round(886 * K)
export const project = (lat, lng) => ({
  x: (87 + ((lng - LNG[0]) / (LNG[1] - LNG[0])) * 1571) * K,
  y: (118 + ((LAT[1] - lat) / (LAT[1] - LAT[0])) * 655) * K,
})
