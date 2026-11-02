// Google Gemini API 호출 (REST). 서버 함수(/api)에서만 사용 — 키는 브라우저에 나가지 않음
// 모델 이름은 .env 의 GEMINI_MODEL 로 바꿀 수 있고, 테스트용으로 GEMINI_BASE 로 주소도 바꿀 수 있음
const BASE = process.env.GEMINI_BASE || 'https://generativelanguage.googleapis.com/v1beta'
// 안내자(도구를 쓰는 대화)용과, 짧은 번역용(더 빠른 모델)을 따로 둠 — 둘 다 .env 로 바꿀 수 있음
// (모델마다 응답 속도가 크게 달라서, 응답이 없으면 .env.local 의 GEMINI_MODEL 을 바꿔 보세요)
export const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash'
export const FAST_MODEL = process.env.GEMINI_FAST_MODEL || 'gemini-3.1-flash-lite'
const TIMEOUT_MS = 50_000

export class GeminiError extends Error {
  constructor(message, status) { super(message); this.status = status }
}

// contents: [{ role: 'user' | 'model', parts: [...] }]
export async function generate({ system, contents, tools, json = false, maxTokens = 1024, model = MODEL }) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new GeminiError('GEMINI_API_KEY 가 없어요 (.env.local 확인)', 500)

  const body = {
    contents,
    generationConfig: { maxOutputTokens: maxTokens, ...(json ? { responseMimeType: 'application/json' } : {}) },
  }
  if (system) body.systemInstruction = { parts: [{ text: system }] }
  if (tools) body.tools = [{ functionDeclarations: tools }]

  let r
  try {
    r = await fetch(`${BASE}/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS), // 응답이 없으면 무한정 기다리지 않음
    })
  } catch (e) {
    throw new GeminiError(e.name === 'TimeoutError'
      ? `Gemini(${model}) 응답이 ${TIMEOUT_MS / 1000}초 안에 오지 않았어요. .env 의 GEMINI_MODEL 을 다른 모델로 바꿔 보세요.`
      : `Gemini 에 연결하지 못했어요: ${e.cause?.code ?? e.message}`, 504)
  }
  const data = await r.json().catch(() => ({}))
  if (!r.ok) {
    const msg = data?.error?.message ?? r.statusText
    throw new GeminiError(r.status === 429 ? '사용량이 많아요. 잠시 뒤 다시 시도하세요.' : `Gemini 오류 (${r.status}): ${msg}`, r.status)
  }
  const cand = data.candidates?.[0]
  if (!cand?.content) {
    throw new GeminiError(`Gemini 가 답을 만들지 못했어요 (${cand?.finishReason ?? data.promptFeedback?.blockReason ?? '이유 모름'})`, 502)
  }
  return cand.content // { role: 'model', parts: [{ text } | { functionCall: { name, args } }] }
}

export const textOf = (content) => (content.parts ?? []).map((p) => p.text ?? '').join('')
export const callsOf = (content) => (content.parts ?? []).filter((p) => p.functionCall).map((p) => p.functionCall)
