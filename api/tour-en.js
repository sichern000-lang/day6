import { searchTourEng } from '../server/tourEng.js'

export default async function handler(req, res) {
  try {
    res.status(200).json(await searchTourEng({ keyword: req.query.keyword, contentTypeId: req.query.type }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
