import { FAST_MODEL, generate, textOf } from '../server/gemini.js'
import { LANGS, englishName } from '../src/lib/langs.js'

// 신화·민담 한 편을 Google 검색으로 찾아 요약한다 (Gemini 의 검색 연결 기능).
// 도청 데이터에는 본문이 없으므로 제목·핵심어로 추측하지 않고, 검색에서 찾은 내용만 요약한다.
// 검색 기능은 Gemini API 의 유료 요금제(결제 연결)에서 쓸 수 있고, 안 되면 429 오류가 난다.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const { title, kind, tags = [], lang = 'ko' } = req.body ?? {}
  if (typeof title !== 'string' || !title || title.length > 100) return res.status(400).json({ error: 'title 이 필요해요' })
  if (!LANGS.some((l) => l.id === lang)) return res.status(400).json({ error: 'lang 이 올바르지 않아요' })
  const keywords = (Array.isArray(tags) ? tags : []).filter((t) => typeof t === 'string').slice(0, 8).map((t) => t.slice(0, 30))

  const system = `You research Jeju Island (Korea) myths and folktales for an archive.
Use Google Search to find the specific tale the user names (the title is Korean), then summarize what the sources say in 3 to 5 plain sentences in ${englishName(lang)}.
Rules:
- Use only what you found in search results. Do not guess the plot from the title or keywords.
- If you cannot find reliable information about this specific tale, say so in one short sentence instead of inventing anything.
- No headings, no lists, no citations markers. Output only the sentences.`

  try {
    const reply = await generate({
      system, search: true, maxTokens: 700, model: FAST_MODEL,
      contents: [{ role: 'user', parts: [{ text: `Jeju ${kind === 'myth' ? 'myth (신화)' : 'folktale (민담)'}: "${title}"${keywords.length ? ` (related words: ${keywords.join(', ')})` : ''}` }] }],
    })
    const seen = new Set()
    const sources = (reply.groundingMetadata?.groundingChunks ?? [])
      .map((c) => c.web).filter((w) => w?.uri && !seen.has(w.uri) && seen.add(w.uri))
      .slice(0, 4).map((w) => ({ title: w.title ?? w.uri, url: w.uri }))
    res.status(200).json({ summary: textOf(reply).trim(), sources })
  } catch (e) {
    res.status(e.status ?? 500).json({ error: e.message })
  }
}
