// 신화·민담 핵심어(키워드)를 영어·스페인어·독일어로 미리 번역해 src/data/folk-tags.json 에 저장하는 스크립트.
// 실행: node --env-file=.env.local scripts/translate-tags.mjs <catalog.json>
//   catalog.json 은 /api/catalog 응답을 저장한 파일 (항목마다 tags 배열이 있음). 이미 번역된 낱말은 건너뜀(이어하기 가능).
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { FAST_MODEL, generate, textOf } from '../server/gemini.js'

const OUT = new URL('../src/data/folk-tags.json', import.meta.url)
const catalog = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const done = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
const all = [...new Set(catalog.flatMap((i) => i.tags))]
const todo = all.filter((t) => !done[t])
console.log(`전체 ${all.length}개 중 남은 ${todo.length}개`)

const system = `You translate keywords of Jeju Island (Korea) myths and folktales into English, Spanish and German for foreign visitors.
Each keyword is Korean or Jeju dialect, sometimes with the standard-Korean meaning in parentheses (e.g. "손지(손자)").
- Common nouns: translate the meaning in 1-4 words.
- Personal names, deity names and place names: romanize them (Revised Romanization, Title Case) and add a very short gloss only when the name has a clear meaning.
- Never invent a story. If unsure, romanize only.
Output ONLY a JSON object: {"<keyword>": {"en": "...", "es": "...", "de": "..."}, ...} with every input keyword as a key.`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
for (let i = 0; i < todo.length; i += 50) {
  const chunk = todo.slice(i, i + 50)
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const reply = await generate({ system, json: true, maxTokens: 6000, model: FAST_MODEL, contents: [{ role: 'user', parts: [{ text: JSON.stringify(chunk) }] }] })
      const out = JSON.parse(textOf(reply))
      let ok = 0
      for (const k of chunk) {
        const v = out[k]
        if (v?.en && v?.es && v?.de) { done[k] = { en: String(v.en), es: String(v.es), de: String(v.de) }; ok++ }
      }
      writeFileSync(OUT, JSON.stringify(done, null, 0).replace(/\},"/g, '},\n"'))
      console.log(`${i + chunk.length}/${todo.length} (이번 묶음 ${ok}/${chunk.length})`)
      break
    } catch (e) {
      console.log(`  재시도 ${attempt}: ${e.message.slice(0, 80)}`)
      await sleep(4000 * attempt)
    }
  }
  await sleep(1200)
}
console.log('완료:', Object.keys(done).length)
