import { searchTour } from '../server/tour.js'

export default async function handler(req, res) {
  try {
    res.status(200).json(await searchTour({ keyword: req.query.keyword, contentTypeId: req.query.type }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
