// 화면 → 우리 서버 함수(/api) 호출 모음. 공공데이터 API 는 브라우저에서 직접 부르지 않습니다(키 노출·CORS).

async function readJson(r) {
  let data
  try { data = await r.json() }
  catch { throw new Error(`서버 응답이 JSON이 아님 (${r.status}) — vercel dev 로 실행했는지 확인하세요`) }
  if (!r.ok) throw new Error(data.error || r.statusText)
  return data
}

const get = async (path) => readJson(await fetch(path))
const post = async (path, body) => readJson(await fetch(path, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}))

export const ping = () => get('/api/hello')

// 공공데이터 3종
export const fetchWeather = (place = '제주시') => get(`/api/weather?place=${encodeURIComponent(place)}`)
export const fetchPlaces = (keyword = '') => get(`/api/tour?keyword=${encodeURIComponent(keyword)}`)
export const fetchPlacesEn = (keyword = '') => get(`/api/tour-en?keyword=${encodeURIComponent(keyword)}`)
export const fetchHeritage = (keyword = '') => get(`/api/heritage?keyword=${encodeURIComponent(keyword)}`)

// AI
export const askAgent = (message, history, lang) => post('/api/agent', { message, history, lang })
