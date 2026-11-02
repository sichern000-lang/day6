import { getCatalog } from '../server/folk.js'

export default async function handler(req, res) {
  try {
    const items = await getCatalog()
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400') // 6시간 캐시
    res.status(200).json(items)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
