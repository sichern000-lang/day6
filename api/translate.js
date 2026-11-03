import { FAST_MODEL, GeminiError, generate, textOf } from '../server/gemini.js'
import { fail, tooMany } from '../server/guard.js'
import { LANGS, englishName } from '../src/lib/langs.js'

// 국가유산 이름처럼 한국어로만 오는 짧은 낱말들을 영어로 옮긴다 (고유명사는 로마자 + 뜻)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (tooMany(req, res, { max: 60 })) return
  const { texts, lang = 'en' } = req.body ?? {}
  if (lang === 'ko' || !LANGS.some((l) => l.id === lang)) return res.status(400).json({ error: 'lang: en, es, de 중 하나여야 해요' })
  if (!Array.isArray(texts) || texts.length === 0 || texts.length > 40 || texts.some((t) => typeof t !== 'string' || t.length > 100)) {
    return res.status(400).json({ error: 'texts: 1~40개의 짧은 문자열 배열이 필요해요' })
  }

  const system = `You translate short Korean labels (Jeju place names, national heritage names and categories, city names) into ${englishName(lang)} for foreign visitors.
- Keep proper nouns recognisable: romanise the name and add a short gloss in ${englishName(lang)} when helpful (e.g. "Sanbangsan Mountain").
- Never invent facts. Output only a JSON array of strings, same length and order as the input.`

  try {
    const reply = await generate({
      system, json: true, maxTokens: 2048, model: FAST_MODEL,
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(texts) }] }],
    })
    const raw = textOf(reply)
    const out = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1))
    if (!Array.isArray(out) || out.length !== texts.length) throw new Error('번역 결과 개수가 맞지 않아요')
    res.status(200).json({ texts: out.map(String) })
  } catch (e) {
    if (e instanceof GeminiError) return res.status(e.status ?? 500).json({ error: e.message })
    fail(res, e)
  }
}
