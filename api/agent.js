import { getStory } from '../server/stories.js'
import { searchTour } from '../server/tour.js'
import { searchTourEng } from '../server/tourEng.js'
import { getWeather } from '../server/weather.js'
import { searchHeritage } from '../server/heritage.js'
import { generate, callsOf, textOf } from '../server/gemini.js'
import { englishName } from '../src/lib/langs.js'

// ① 도구 설명서 — Gemini 는 이 설명만 보고 어떤 도구를 쓸지 정한다 (functionDeclarations)
const tools = [
  {
    name: 'get_story',
    description: '신화지도 데이터에서 제주 신화·전설을 찾는다. 인물·장소·종류(창조신화, 건국신화, 지형전설, 마을전설, 당신화)로 검색',
    parameters: { type: 'OBJECT', properties: { keyword: { type: 'STRING', description: '예: 설문대할망, 산방산, 지형전설' } } },
  },
  {
    name: 'search_tour_places',
    description: '한국관광공사 TourAPI 로 제주의 장소를 검색한다 (이야기의 무대 찾기)',
    parameters: { type: 'OBJECT', properties: { keyword: { type: 'STRING', description: '예: 한라산, 삼성혈' } } },
  },
  {
    name: 'get_weather',
    description: '기상청 단기예보로 제주시/서귀포시의 앞으로 몇 시간 날씨를 조회한다',
    parameters: {
      type: 'OBJECT',
      properties: { place: { type: 'STRING', enum: ['제주시', '서귀포시'] } },
      required: ['place'],
    },
  },
  {
    name: 'search_heritage',
    description: '국가유산청 API 로 제주의 국가유산을 이름으로 검색한다',
    parameters: { type: 'OBJECT', properties: { keyword: { type: 'STRING' } } },
  },
]

// ② 도구 이름 → 실제 실행 함수
const runTool = {
  get_story: getStory,
  search_tour_places: searchTour,
  get_weather: getWeather,
  search_heritage: searchHeritage,
}

const SYSTEM = `너는 '신화지도'의 이야기 안내자다. 제주 신화·전설을 들려주고, 그 이야기의 무대를 찾아가도록 돕는다.
- 이야기는 반드시 get_story 로 확인한 뒤 말한다. 데이터에 없는 이야기는 지어내지 않고 모른다고 말한다.
- "가 볼 만한 곳" 질문은 이야기 → 날씨 → 장소 순서로 도구를 이어서 쓴다.
- 장소·날씨·유산 정보는 도구 결과에 있는 것만 말한다.
- 비가 오거나 강수확률이 높으면 야외 대신 실내 대안을 함께 제안한다.
- 신화는 전승에 따라 다르다는 점을 필요하면 짧게 덧붙인다.
- 한국어로 5문장 이내, 이야기꾼처럼 다정하게.`

const langRule = (language) => `
- The user is a foreign visitor. Answer in ${language}, in at most 5 sentences.
- Story data is in Korean: translate it faithfully when you answer, and never add details that are not in the data.
- For search_tour_places use English keywords (e.g. Hallasan); the results are English tourism data.
- Heritage names come from a Korean-only source: give a short ${language} gloss when you mention them.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const { message, history = [], lang = 'ko' } = req.body ?? {}
  const foreign = lang !== 'ko' // 한국어 외에는 영문 관광정보 + 해당 언어로 답변
  // 영어 모드: 영문 관광정보 API 와 영어 답변
  const run = foreign ? { ...runTool, search_tour_places: searchTourEng } : runTool
  const system = foreign ? SYSTEM + langRule(englishName(lang)) : SYSTEM

  // 화면에서 온 대화({role:'user'|'assistant', content}) → Gemini 형식({role:'user'|'model', parts})
  const contents = [
    ...history.slice(-10).map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(m.content ?? '') }] })),
    { role: 'user', parts: [{ text: String(message ?? '') }] },
  ]
  const steps = [] // 화면에 "에이전트가 무엇을 했는지" 보여주기용 호출 내역

  try {
    // ③ 에이전트 루프: 생각 → 도구 호출 → 결과 확인 → (반복) → 최종 답
    for (let turn = 0; turn < 6; turn++) {
      const reply = await generate({ system, contents, tools })
      const calls = callsOf(reply)
      if (calls.length === 0) return res.status(200).json({ answer: textOf(reply), steps })

      contents.push(reply) // 도구 호출 요청을 대화에 그대로 기록 (Gemini 가 요구하는 부가 정보도 함께 보존)
      const responses = []
      for (const call of calls) {
        let result
        try {
          if (!run[call.name]) throw new Error(`알 수 없는 도구: ${call.name}`)
          result = await run[call.name](call.args ?? {})
        }
        catch (e) { result = { error: e.message } }
        steps.push({ tool: call.name, args: call.args, count: Array.isArray(result) ? result.length : 0, error: result?.error })
        // functionResponse.response 는 객체여야 해서 배열은 { items } 로 감쌈
        responses.push({ functionResponse: { name: call.name, response: Array.isArray(result) ? { items: result } : result } })
      }
      contents.push({ role: 'user', parts: responses })
    }
    res.status(200).json({ answer: '도구를 너무 많이 써서 멈췄어요. 질문을 좁혀 주세요.', steps })
  } catch (e) {
    res.status(e.status ?? 500).json({ error: e.message })
  }
}
