import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-haiku-5-5'

// 국가유산 이름처럼 한국어로만 오는 짧은 낱말들을 영어로 옮긴다 (고유명사는 로마자 + 뜻)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const { texts } = req.body ?? {}
  if (!Array.isArray(texts) || texts.length === 0 || texts.length > 40 || texts.some((t) => typeof t !== 'string' || t.length > 100)) {
    return res.status(400).json({ error: 'texts: 1~40개의 짧은 문자열 배열이 필요해요' })
  }

  const system = `You translate short Korean labels (Jeju place names, national heritage names and categories, city names) into English for foreign visitors.
- Keep proper nouns recognisable: romanise the name and add a short English gloss when helpful (e.g. "Sanbangsan Mountain").
- Never invent facts. Output only a JSON array of strings, same length and order as the input.`

  try {
    const r = await client.messages.create({
      model: MODEL, max_tokens: 1024, system,
      messages: [{ role: 'user', content: JSON.stringify(texts) }],
    })
    const raw = r.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
    const out = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1))
    if (!Array.isArray(out) || out.length !== texts.length) throw new Error('번역 결과 개수가 맞지 않아요')
    res.status(200).json({ texts: out })
  } catch (e) {
    res.status(e.status ?? 500).json({ error: e.status === 429 ? '사용량이 많아요. 잠시 뒤 다시 시도하세요.' : e.message })
  }
}
