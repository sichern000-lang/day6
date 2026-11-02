// 한국관광공사 영문 관광정보 서비스 (EngService)
// End Point 는 .env 의 TOUR_ENG_BASE 로 바꿀 수 있습니다 (포털의 활용신청 상세 페이지 값과 맞추세요)
const BASE = process.env.TOUR_ENG_BASE || 'https://apis.data.go.kr/B551011/EngService2'

export async function searchTourEng({ keyword = '', contentTypeId = '', rows = 8 } = {}) {
  const params = new URLSearchParams({
    serviceKey: process.env.TOUR_ENG_KEY || process.env.DATA_GO_KR_KEY, // ★ Decoding 키
    MobileOS: 'ETC',
    MobileApp: 'SinhwaMap',
    _type: 'json',
    numOfRows: String(rows),
    pageNo: '1',
    areaCode: '39', // 39 = Jeju
  })
  if (contentTypeId) params.set('contentTypeId', contentTypeId)
  const op = keyword ? 'searchKeyword2' : 'areaBasedList2'
  if (keyword) params.set('keyword', keyword)

  const r = await fetch(`${BASE}/${op}?${params}`)
  const text = await r.text()
  let data
  try { data = JSON.parse(text) }
  catch { throw new Error('영문 TourAPI 응답이 JSON이 아님: ' + text.slice(0, 120)) }

  const item = data?.response?.body?.items?.item
  const list = !item ? [] : Array.isArray(item) ? item : [item]
  return list.map((p) => ({ id: p.contentid, title: p.title, addr: p.addr1, image: p.firstimage }))
}
