import { searchHeritage } from '../server/heritage.js'
import { closed, fail } from '../server/guard.js'

export default async function handler(req, res) {
  if (closed(res)) return
  try {
    res.status(200).json(await searchHeritage({ keyword: req.query.keyword }))
  } catch (e) {
    fail(res, e)
  }
}
