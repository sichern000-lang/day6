import folk from '../data/folk-groups.json'

export const FOLK = folk
export const GROUP = Object.fromEntries(folk.groups.map((g) => [g.id, g]))
const KW_AT = { ko: 0, en: 1, es: 2, de: 3 } // keywords: [한국어, 영어, 스페인어, 독일어]

// 종류·분류 이름 — 해당 언어가 없으면 영어, 그다음 한국어
export const label = (o, lang) => o[lang] ?? o.en ?? o.ko
export const keywordLabel = (kw, lang) => kw[KW_AT[lang]] ?? kw[1] ?? kw[0]
