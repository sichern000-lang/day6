// 제주도청 설화(신화)·민담 OpenAPI — 인증키 불필요, XML. 제목·분류·핵심어만 제공 (원문 PDF/전자책 링크는 현재 열리지 않음)
import { XMLParser } from 'fast-xml-parser'
import folk from '../src/data/folk-groups.json' with { type: 'json' }

const parser = new XMLParser({ parseTagValue: false })
const BASE = 'http://www.jeju.go.kr/rest'
const SOURCES = [
  { kind: 'myth', url: `${BASE}/JejuMythContents/getJejuMythContentsList` },
  { kind: 'folktale', url: `${BASE}/JejuFolktaleContents/getJejuFolktaleContentsList` },
]

// 분류코드(category2) → 그룹 id (src/data/folk-groups.json 의 codes)
const GROUP_OF = Object.fromEntries(folk.groups.flatMap((g) => g.codes.map((c) => [c, g.id])))
const clean = (s) => String(s ?? '').replace(/["“”*]/g, '').trim()

async function fetchSource({ kind, url }) {
  const r = await fetch(`${url}?page=1&pageSize=1000`)
  const data = parser.parse(await r.text())
  const item = data?.jejunetApi?.items?.item
  if (!item) throw new Error(`${kind} 응답에 items 가 없어요`)
  const list = Array.isArray(item) ? item : [item]

  // 원문·해제·현지조사가 같은 이야기를 따로 싣고 있어서 제목으로 합침
  const byTitle = new Map()
  for (const it of list) {
    const group = GROUP_OF[it.category2]
    const title = clean(it.title)
    if (!group || !title) continue
    const key = title.replace(/\s/g, '')
    const row = byTitle.get(key) ?? { id: it.codeNo, kind, group, title, tags: [] }
    for (const t of String(it.tag ?? '').split(/[,，]/)) {
      const tag = t.trim()
      if (tag && !row.tags.includes(tag) && row.tags.length < 12) row.tags.push(tag)
    }
    byTitle.set(key, row)
  }
  return [...byTitle.values()]
}

let cache = null // { at, items }
const TTL = 6 * 3600e3

export async function getCatalog() {
  if (cache && Date.now() - cache.at < TTL) return cache.items
  try {
    const items = (await Promise.all(SOURCES.map(fetchSource))).flat()
    cache = { at: Date.now(), items }
    return items
  } catch (e) {
    if (cache) return cache.items // 도청 서버가 잠깐 안 될 때는 이전 결과를 그대로 사용
    throw e
  }
}
