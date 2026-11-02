// 지원하는 언어 — 새 언어를 추가할 때 여기에 한 줄 + src/locales/ 에 문구 파일 + 데이터 번역을 더하면 됩니다
export const LANGS = [
  { id: 'ko', label: 'KO', name: '한국어', locale: 'ko-KR', english: 'Korean' },
  { id: 'en', label: 'EN', name: 'English', locale: 'en-US', english: 'English' },
  { id: 'es', label: 'ES', name: 'Español', locale: 'es-ES', english: 'Spanish' },
  { id: 'de', label: 'DE', name: 'Deutsch', locale: 'de-DE', english: 'German' },
]
export const isKo = (lang) => lang === 'ko'
export const localeOf = (lang) => LANGS.find((l) => l.id === lang)?.locale ?? 'ko-KR'
export const englishName = (lang) => LANGS.find((l) => l.id === lang)?.english ?? 'English'
