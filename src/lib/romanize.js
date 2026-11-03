// 한글 → 로마자 (국어의 로마자 표기법). 소리 나는 대로 적는 규칙(연음, 비음화, 유음화)을 반영함.
// 예: 한라산 → Hallasan, 신라 → Silla, 본풀이 → Bonpuri, 백록담 → Baengnokdam
const CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']
const JUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i']
const CHO_J = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
const JONG_J = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
// 받침 겹글자: 모음 앞에서는 [남는 소리, 넘어가는 소리], 그 밖에서는 대표음 하나
const SPLIT = { ㄳ: ['ㄱ', 'ㅅ'], ㄵ: ['ㄴ', 'ㅈ'], ㄶ: ['ㄴ', ''], ㄺ: ['ㄹ', 'ㄱ'], ㄻ: ['ㄹ', 'ㅁ'], ㄼ: ['ㄹ', 'ㅂ'], ㄽ: ['ㄹ', 'ㅅ'], ㄾ: ['ㄹ', 'ㅌ'], ㄿ: ['ㄹ', 'ㅍ'], ㅀ: ['ㄹ', ''], ㅄ: ['ㅂ', 'ㅅ'] }
const REP = { ㄲ: 'ㄱ', ㅋ: 'ㄱ', ㄳ: 'ㄱ', ㄺ: 'ㄱ', ㅅ: 'ㄷ', ㅆ: 'ㄷ', ㅈ: 'ㄷ', ㅊ: 'ㄷ', ㅌ: 'ㄷ', ㅎ: 'ㄷ', ㄵ: 'ㄴ', ㄶ: 'ㄴ', ㄻ: 'ㅁ', ㄼ: 'ㄹ', ㄽ: 'ㄹ', ㄾ: 'ㄹ', ㅀ: 'ㄹ', ㅍ: 'ㅂ', ㄿ: 'ㅂ', ㅄ: 'ㅂ' }
const END = { ㄱ: 'k', ㄴ: 'n', ㄷ: 't', ㄹ: 'l', ㅁ: 'm', ㅂ: 'p', ㅇ: 'ng' }
const NASAL = { ㄱ: 'ㅇ', ㄷ: 'ㄴ', ㅂ: 'ㅁ' }

const isHangul = (c) => c >= 0xac00 && c <= 0xd7a3
const parse = (ch) => {
  const c = ch.charCodeAt(0) - 0xac00
  return { cho: CHO_J[Math.floor(c / 588)], jung: JUNG[Math.floor((c % 588) / 28)], jong: JONG_J[c % 28] }
}

function word(chars) {
  const s = chars.map(parse)
  for (let i = 0; i < s.length - 1; i++) {
    const a = s[i], b = s[i + 1]
    if (!a.jong) continue
    if (b.cho === 'ㅇ' && a.jong !== 'ㅇ') {            // 연음: 받침이 다음 글자의 첫소리로 넘어감
      if (SPLIT[a.jong]) { const [keep, move] = SPLIT[a.jong]; a.jong = keep; b.cho = move || 'ㅇ' }
      else if (a.jong === 'ㅎ') a.jong = ''
      else { b.cho = a.jong; a.jong = '' }
      continue
    }
    const rep = REP[a.jong] ?? a.jong
    a.jong = rep
    const placeRi = b.cho === 'ㄹ' && b.jung === 'i' && !b.jong && i + 1 === s.length - 1 && s.length >= 3   // 송당리·성산리처럼 끝의 '리'(마을)는 그대로 ri
    if (placeRi) continue
    if (b.cho === 'ㄹ') {                                // ㄴ+ㄹ → ㄹㄹ, ㄱ/ㅂ/ㅁ/ㅇ+ㄹ → …ㄴ
      if (rep === 'ㄴ') a.jong = 'ㄹ'
      else if (rep !== 'ㄹ') { b.cho = 'ㄴ'; if (NASAL[rep]) a.jong = NASAL[rep] }
    } else if (b.cho === 'ㄴ' || b.cho === 'ㅁ') {
      if (NASAL[rep]) a.jong = NASAL[rep]
      if (rep === 'ㄹ' && b.cho === 'ㄴ') b.cho = 'ㄹ'
    }
  }
  let out = '', prevEnd = ''
  for (const x of s) {
    let init = CHO[CHO_J.indexOf(x.cho)]
    if (x.cho === 'ㄹ' && prevEnd === 'ㄹ') init = 'l'   // ㄹㄹ → ll
    const fin = REP[x.jong] ?? x.jong
    out += init + x.jung + (END[fin] ?? '')
    prevEnd = fin
  }
  return out
}

// 문장 전체: 한글 덩어리마다 변환하고, 단어 첫 글자는 대문자로
export function romanize(text) {
  if (!text) return ''
  let out = '', buf = []
  const flush = () => { if (buf.length) { out += word(buf); buf = [] } }
  for (const ch of text) {
    if (isHangul(ch.charCodeAt(0))) buf.push(ch)
    else { flush(); out += ch }
  }
  flush()
  return out.replace(/(^|[\s(·\-/])([a-z])/g, (_, p, c) => p + c.toUpperCase())
}
