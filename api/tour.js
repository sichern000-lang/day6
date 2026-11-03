import { searchTour } from '../server/tour.js'
import { closed, fail } from '../server/guard.js'

export default async function handler(req, res) {
  if (closed(res)) return
  try {
    res.status(200).json(await searchTour({ keyword: req.query.keyword, contentTypeId: req.query.type }))
  } catch (e) {
    fail(res, e)
  }
}
