import { getCatalog } from '../server/folk.js'
import { closed, fail } from '../server/guard.js'

export default async function handler(req, res) {
  if (closed(res)) return
  try {
    const items = await getCatalog()
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400') // 6시간 캐시
    res.status(200).json(items)
  } catch (e) {
    fail(res, e)
  }
}
