// Google Gemini API 호출 (REST). 서버 함수(/api)에서만 사용 — 키는 브라우저에 나가지 않음
// 모델 이름은 .env 의 GEMINI_MODEL 로 바꿀 수 있고, 테스트용으로 GEMINI_BASE 로 주소도 바꿀 수 있음
const BASE = process.env.GEMINI_BASE || 'https://generativelanguage.googleapis.com/v1beta'
// 시연(베타)에서는 "가장 빠른 모델"보다 "끝까지 동작하는 것"이 중요해서, 모델이 바쁘거나(503)·한도에 걸리거나(429)·사라졌으면(404)
// 자동으로 다음 모델로 넘어가 다시 시도함. 쓸 모델과 순서는 .env 의 GEMINI_MODEL / GEMINI_FAST_MODEL / GEMINI_FALLBACK_MODELS(쉼표로 구분)로 바꿀 수 있음
export const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest'
export const FAST_MODEL = process.env.GEMINI_FAST_MODEL || 'gemini-flash-lite-latest'
const FALLBACKS = (process.env.GEMINI_FALLBACK_MODELS || 'gemini-3.5-flash,gemini-3.1-flash-lite').split(',').map((m) => m.trim()).filter(Boolean)
const TIMEOUT_MS = 25_000          // 모델 하나당 기다리는 시간
const BUDGET_MS = 45_000           // 이 시간이 지나면 다음 모델로 넘어가지 않고 멈춤 (Vercel 함수 제한 안에서 끝내려고)
const RETRYABLE = new Set([404, 429, 500, 502, 503, 504])

export class GeminiError extends Error {
  constructor(message, status) { super(message); this.status = status }
}

async function callOnce(model, body, key) {
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
      ? `Gemini(${model}) 응답이 ${TIMEOUT_MS / 1000}초 안에 오지 않았어요.`
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
  return cand
}

// contents: [{ role: 'user' | 'model', parts: [...] }]
export async function generate({ system, contents, tools, search = false, json = false, maxTokens = 1024, model = MODEL }) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new GeminiError('GEMINI_API_KEY 가 없어요 (.env.local 확인)', 500)

  const body = {
    contents,
    generationConfig: { maxOutputTokens: maxTokens, ...(json ? { responseMimeType: 'application/json' } : {}) },
  }
  if (system) body.systemInstruction = { parts: [{ text: system }] }
  if (tools) body.tools = [{ functionDeclarations: tools }]
  if (search) body.tools = [{ google_search: {} }]   // Google 검색으로 근거를 찾아 답함 (출처는 groundingMetadata)

  const chain = [model, ...FALLBACKS.filter((m) => m !== model)]
  const t0 = Date.now()
  let lastError
  for (const m of chain) {
    try {
      const cand = await callOnce(m, body, key)
      // 검색을 쓴 답이면 출처 정보를 content 에 붙여 돌려줌
      return search ? { ...cand.content, groundingMetadata: cand.groundingMetadata } : cand.content // { role: 'model', parts: [{ text } | { functionCall: { name, args } }] }
    } catch (e) {
      lastError = e
      if (!RETRYABLE.has(e.status) || Date.now() - t0 > BUDGET_MS) break   // 키 오류 같은 건 다른 모델로 바꿔도 소용없음
    }
  }
  throw lastError
}

export const textOf = (content) => (content.parts ?? []).map((p) => p.text ?? '').join('')
export const callsOf = (content) => (content.parts ?? []).filter((p) => p.functionCall).map((p) => p.functionCall)
