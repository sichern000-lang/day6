// 동작 확인용 → /api/hello  (키 값은 내보내지 않고 "있는지"만 알려줍니다)
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    hasDataKey: Boolean(process.env.DATA_GO_KR_KEY),
    hasEngKey: Boolean(process.env.TOUR_ENG_KEY || process.env.DATA_GO_KR_KEY),
    hasAiKey: Boolean(process.env.GEMINI_API_KEY),
  })
}
