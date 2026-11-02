import titlesEn from '../data/folk-titles-en.json'

// 신화·민담 제목의 영어 번역 — 미리 넣어 둔 번역을 먼저 쓰고, 없는 제목만 실시간 번역(useTranslated)으로 채움
export const staticEnTitle = (title) => titlesEn[title]
