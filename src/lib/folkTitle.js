import titles from '../data/folk-titles.json'

// 신화·민담 제목의 번역(영어·스페인어·독일어) — 미리 넣어 둔 번역을 먼저 쓰고, 없는 제목만 실시간 번역(useTranslated)으로 채움
// 한국어이거나 번역이 없으면 undefined
export const folkTitle = (title, lang) => titles[title]?.[lang]
