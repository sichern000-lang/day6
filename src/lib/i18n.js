// 화면 문구 — 새 문구는 ko/en 양쪽에 같은 키로 추가하세요
const STR = {
  ko: {
    announce: '제주 신화·전설을 지도 위에서 만나 보세요',
    brand: '신화지도',
    'nav.home': '홈', 'nav.map': '신화 지도', 'nav.stories': '이야기', 'nav.guide': '안내자', 'nav.notebook': '내 수첩',
    anon: '익명',
    footer: '데이터: 기상청 · 한국관광공사 · 국가유산청(공공데이터포털) · 신화는 전승에 따라 다르며 요약은 학습용입니다',

    'home.h1a': '신들의 섬,', 'home.h1pre': '', 'home.h1em': '이야기', 'home.h1post': '를 따라 걷다',
    'home.cta': '지도 펼치기',
    'home.display': '이야기를 천천히,\n장소와 함께.', 'home.lede': '오늘의 이야기부터 골라 보세요.',
    'home.today': 'TODAY', 'home.read': '읽어 보기', 'home.prev': '이전', 'home.next': '다음',
    'home.telling': '우리가 이야기를 전하는 방식은 설화와 그 이야기가 태어난 땅을 다시 이어 주는 일입니다. 한라산도, 바위도, 동굴도, 마을의 당도 그저 풍경이 아니라 이야기가 시작된 자리라는 것을 떠올리는 일이에요. 오늘의 날씨와, 지금도 그 이름을 품은 장소와, 이야기를 지켜 온 국가유산까지 함께 보며 직접 걸어 보는 일. 읽는 데서 끝나지 않고, 땅에 뿌리내린 이야기를 즐기고 그 이야기가 어디서 왔는지 알아 가는 일입니다.',
    'home.ask': '안내자에게 묻기', 'home.status': '준비 상태',
    'home.nick': '닉네임', 'home.nickph': '닉네임을 입력하세요', 'home.nickhint': '내 수첩이 이 닉네임으로 저장돼요.',
    'check.react': 'React · 라우터', 'check.react.ok': '이 화면이 보이면 OK',
    'check.wait': '확인 중…', 'check.ok': '연결 OK',
    'check.sbfail': '.env.local 에 Supabase 값을 넣으세요',
    'check.apifail': 'npm run dev 가 아니라 vercel dev 로 실행하세요',

    'map.title': '신화 지도', 'map.sub': '핀을 눌러 이야기를 만나 보세요 (위치는 대략적인 표시예요)', 'map.selected': '선택한 이야기',
    'stories.title': '이야기 목록', 'stories.sub': '신화·전설 {n}편', 'stories.search': '이름·장소로 검색', 'stories.none': '맞는 이야기가 없어요',

    'detail.back': '지도로', 'detail.note': '신화는 전승에 따라 내용이 조금씩 달라요.', 'detail.save': '＋ 내 수첩에 담기',
    'detail.places': '이야기의 무대', 'detail.placesSrc': '한국관광공사', 'detail.noPlaces': '관련 장소가 없어요',
    'detail.heritage': '국가유산', 'detail.heritageSrc': '국가유산청', 'detail.noHeritage': '관련 유산이 없어요',
    'detail.heritageNote': '', 'detail.copy': '주소 복사', 'toast.copied': '주소를 복사했어요', 'toast.copyfail': '복사하지 못했어요',

    'guide.title': '이야기 안내자', 'guide.sub': '이야기·장소·날씨·유산 도구를 스스로 골라 쓰는 AI 에이전트',
    'guide.example': '예) “산방산 전설 들려주고, 오늘 서귀포 날씨에 가도 괜찮을지 알려줘”',
    'guide.loading': '안내자가 도구를 쓰는 중…', 'guide.ph': '무엇이든 물어보세요', 'guide.send': '보내기',
    'tool.get_story': '이야기', 'tool.search_tour_places': '관광 장소', 'tool.get_weather': '날씨', 'tool.search_heritage': '국가유산',

    'nb.title': '내 수첩', 'nb.sub': '{who} 님이 담은 이야기 · Supabase 에 저장',
    'nb.nosb': 'Supabase 설정(.env.local)이 필요해요', 'nb.empty': '아직 담은 이야기가 없어요. 이야기 상세에서 ＋ 내 수첩에 담기를 눌러 보세요',
    'nb.visited': '✅ 가 봤어요', 'nb.notyet': '아직 안 가 봤어요', 'nb.visit': '가 봤어요', 'nb.cancel': '취소', 'nb.del': '삭제',

    'nf.title': '길을 잃었어요', 'nf.text': '없는 주소예요. 홈에서 다시 출발해 보세요.', 'nf.home': '홈으로',
    'wx.loading': '날씨 확인 중…', 'wx.fail': '날씨를 불러오지 못했어요', 'wx.pop': '강수',
    loading: '불러오는 중…', empty: '결과가 없어요',
    'toast.nosb': 'Supabase 설정(.env.local)이 필요해요', 'toast.dup': '이미 수첩에 있어요', 'toast.saved': "'{title}' 수첩에 담았어요",
  },
  en: {
    announce: 'Meet the myths and legends of Jeju on a map',
    brand: 'Myth Map',
    'nav.home': 'Home', 'nav.map': 'Myth Map', 'nav.stories': 'Stories', 'nav.guide': 'Guide', 'nav.notebook': 'Notebook',
    anon: 'Guest',
    footer: 'Data: Korea Meteorological Administration · Korea Tourism Organization · Korea Heritage Service (data.go.kr) · Myths vary by telling; summaries are for learning.',

    'home.h1a': 'Island of the Gods,', 'home.h1pre': 'Walk the ', 'home.h1em': 'stories', 'home.h1post': '',
    'home.cta': 'OPEN THE MAP',
    'home.display': 'Stories, told slowly,\nwith their places.', 'home.lede': 'Start with today’s story.',
    'home.today': 'TODAY', 'home.read': 'READ', 'home.prev': 'Previous', 'home.next': 'Next',
    'home.telling': 'Our way of telling is about restoring the connection between a story and the ground it came from. It’s remembering that Hallasan, a stone, a cave or a village shrine were never just scenery. They are where the tale began. It’s seeing today’s weather, the places that still carry its name and the heritage that kept it alive, and then walking there. It’s growing a love for stories rooted in place, and knowing where a tale really comes from.',
    'home.ask': 'ASK THE GUIDE', 'home.status': 'Setup status',
    'home.nick': 'Nickname', 'home.nickph': 'Enter a nickname', 'home.nickhint': 'Your notebook is saved under this nickname.',
    'check.react': 'React · Router', 'check.react.ok': 'If you see this page, it works',
    'check.wait': 'Checking…', 'check.ok': 'Connected',
    'check.sbfail': 'Add the Supabase values to .env.local',
    'check.apifail': 'Run with vercel dev, not npm run dev',

    'map.title': 'Myth Map', 'map.sub': 'Tap a pin to meet a story (locations are approximate)', 'map.selected': 'Selected story',
    'stories.title': 'All stories', 'stories.sub': '{n} myths and legends', 'stories.search': 'Search by name or place', 'stories.none': 'No matching stories',

    'detail.back': 'Back to map', 'detail.note': 'Myths differ a little from one telling to another.', 'detail.save': '＋ Add to my notebook',
    'detail.places': 'Where it happened', 'detail.placesSrc': 'Korea Tourism Organization', 'detail.noPlaces': 'No related places found',
    'detail.heritage': 'National heritage', 'detail.heritageSrc': 'Korea Heritage Service', 'detail.noHeritage': 'No related heritage found',
    'detail.heritageNote': 'Names are translated from the Korean source.', 'detail.copy': 'Copy address', 'toast.copied': 'Address copied', 'toast.copyfail': 'Could not copy',

    'guide.title': 'Story Guide', 'guide.sub': 'An AI agent that picks its own tools: stories, places, weather and heritage',
    'guide.example': 'e.g. “Tell me the Sanbangsan legend and whether Seogwipo’s weather is good for a visit today”',
    'guide.loading': 'The guide is using its tools…', 'guide.ph': 'Ask anything', 'guide.send': 'SEND',
    'tool.get_story': 'Story', 'tool.search_tour_places': 'Places', 'tool.get_weather': 'Weather', 'tool.search_heritage': 'Heritage',

    'nb.title': 'My Notebook', 'nb.sub': 'Stories saved by {who} · stored in Supabase',
    'nb.nosb': 'Supabase setup (.env.local) is required', 'nb.empty': 'Nothing saved yet. Open a story and tap “Add to my notebook”.',
    'nb.visited': '✅ Visited', 'nb.notyet': 'Not visited yet', 'nb.visit': 'VISITED', 'nb.cancel': 'UNDO', 'nb.del': 'DELETE',

    'nf.title': 'You’re lost', 'nf.text': 'That page doesn’t exist. Start again from home.', 'nf.home': 'HOME',
    'wx.loading': 'Checking weather…', 'wx.fail': 'Could not load weather', 'wx.pop': 'rain',
    loading: 'Loading…', empty: 'No results',
    'toast.nosb': 'Supabase setup (.env.local) is required', 'toast.dup': 'Already in your notebook', 'toast.saved': "Saved '{title}' to your notebook",
  },
}

export function translate(lang, key, vars) {
  let s = STR[lang]?.[key] ?? STR.ko[key] ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v)
  return s
}
