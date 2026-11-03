import { getWeather } from '../server/weather.js'
import { fail } from '../server/guard.js'

export default async function handler(req, res) {
  try {
    res.status(200).json(await getWeather({ place: req.query.place }))
  } catch (e) {
    fail(res, e)
  }
}
