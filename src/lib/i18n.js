// 화면 문구 — 새 문구는 ko/en 양쪽에 같은 키로 추가하세요
import es from '../locales/es.js'
import de from '../locales/de.js'

const STR = {
  ko: {
    announce: '제주의 신화·전설·민담을 열람하고 내 수첩에 저장하세요',
    brand: '제주 이야기 아카이브',
    'nav.home': '홈', 'nav.map': '이야기 지도', 'nav.stories': '이야기', 'nav.notebook': '내 수첩',
    'nav.ask': 'Ask',
    'intro.skip': '건너뛰기', 'intro.hint': '스크롤하거나 눌러서 한 장씩 넘겨 보세요', 'intro.label': '제주 이야기 메모',
    'chat.refresh': '대화 새로 시작', 'chat.close': '닫기', 'chat.error': '답을 가져오지 못했어요',
    anon: '익명',
    footer: '데이터: 기상청 · 한국관광공사 · 국가유산청(공공데이터포털) · 신화는 전승에 따라 다르며 요약은 학습용입니다',

    'home.h1a': '제주의 이야기를', 'home.h1pre': '읽고 ', 'home.h1em': '담다', 'home.h1post': '',
    'home.cta': '아카이브 열람하기',
    'home.display': '이야기를 천천히,\n장소와 함께.', 'home.lede': '오늘의 이야기부터 골라 보세요.',
    'auth.guest': 'Guest로 계속하기', 'auth.login': '로그인', 'auth.signup': '회원가입', 'auth.tLogin': '다시 오셨네요', 'auth.tSignup': '함께 걸어요', 'auth.sLogin': '로그인하면 내 수첩이 어디서든 이어져요.', 'auth.sSignup': '계정을 만들면 담은 이야기와 메모를 저장할 수 있어요.', 'auth.google': 'Google로 계속하기', 'auth.or': '또는', 'auth.email': '이메일', 'auth.password': '비밀번호', 'auth.nick': '닉네임', 'auth.nickph': '수첩에 쓸 이름', 'auth.goLogin': '로그인', 'auth.goSignup': '회원가입', 'auth.toSignup': '아직 계정이 없나요?', 'auth.toLogin': '이미 계정이 있나요?', 'auth.checkmail': '확인 메일을 보냈어요. 메일의 링크를 누르면 가입이 끝나요.', 'auth.nosb': 'Supabase 설정이 필요해요 (.env.local)', 'auth.logout': '로그아웃', 'auth.account': '내 계정', 'auth.admin': '관리자', 'auth.pw': '비밀번호는 6자 이상이어야 해요', 'auth.welcome': '{name} 님, 환영해요', 'auth.bye': '로그아웃했어요', 'auth.busy': '잠시만요…',
    'map.sub': "신화 속 장소 위에, 내 이야기가 담긴 장소를 더해 보세요", 'map.add': "내 장소 추가하기", 'map.addSub': "이름과 짧은 이야기, 대표 그림을 남기면 지도에 핀이 생겨요.", 'map.mine': "내 이야기가 담긴 장소", 'map.none': "아직 추가한 장소가 없어요", 'map.name': "장소 이름", 'map.nameph': "예: 할머니의 감귤밭", 'map.memo': "나의 이야기", 'map.memoph': "이 장소에 얽힌 짧은 메모", 'map.cat': "종류", 'map.catAll': "모든 종류", 'map.addr': "주소 검색", 'map.addrph': "주소나 장소 이름 (제주 안)", 'map.find': "검색", 'map.noresult': "결과가 없어요. 다른 말로 검색해 보세요.", 'map.draw': "대표 그림", 'map.drawHint': "손가락이나 마우스로 그려 보세요", 'map.undo': "되돌리기", 'map.clear': "지우기", 'map.save': "저장", 'map.cancel': "취소", 'map.del': "삭제", 'map.sample': "예시", 'map.local': "Supabase 표(my_places)가 아직 없어 이 기기에만 저장 중이에요. supabase-places.sql 을 실행하면 모두에게 보여요.", 'map.saved': "장소를 추가했어요", 'map.needName': "장소 이름을 적어 주세요", 'map.lore': '제주의 이야기가 담긴 장소', 'home.addStory': '내 이야기 더하기',
    'chat.save': "수첩에 저장", 'chat.saved': "저장됨", 'chat.share': "공유", 'chat.copied': "클립보드에 복사했어요", 'chat.copyFail': "복사하지 못했어요", 'chat.shareHead': "제주 이야기 아카이브 · Ask", 'nb.more': "더 보기", 'nb.less': "접기",
    'home.today': 'TODAY', 'home.read': '읽어 보기', 'home.more': '더 읽기',
    'home.statement': '설화와 그 이야기가 태어난 땅을 다시 잇습니다.\n\n한라산과 바위, 동굴과 마을의 당을 따라 걸으며\n이야기가 시작된 자리와 그 시간을 만납니다.\n\n읽는 것을 넘어, 땅에 뿌리내린 이야기를 경험합니다.',
    'home.storiesTitle': '섬에서 전해진 이야기', 'home.storiesSub': '키워드로 미리보는\n제주 설화',
    'home.telling': '우리가 이야기를 전하는 방식은 설화와 그 이야기가 태어난 땅을 다시 이어 주는 일입니다. 한라산도, 바위도, 동굴도, 마을의 당도 그저 풍경이 아니라 이야기가 시작된 자리라는 것을 떠올리는 일이에요. 오늘의 날씨와, 지금도 그 이름을 품은 장소와, 이야기를 지켜 온 국가유산까지 함께 보며 직접 걸어 보는 일. 읽는 데서 끝나지 않고, 땅에 뿌리내린 이야기를 즐기고 그 이야기가 어디서 왔는지 알아 가는 일입니다.',
    'home.ask': '안내자에게 묻기', 'home.status': '준비 상태',
    'home.nick': '닉네임', 'home.nickph': '닉네임을 입력하세요', 'home.nickhint': '내 수첩이 이 닉네임으로 저장돼요.',
    'check.react': 'React · 라우터', 'check.react.ok': '이 화면이 보이면 OK',
    'check.wait': '확인 중…', 'check.ok': '연결 OK',
    'check.sbfail': '.env.local 에 Supabase 값을 넣으세요',
    'check.apifail': 'npm run dev 가 아니라 vercel dev 로 실행하세요',

    'map.title': '신화 지도', 'map.selected': '선택한 이야기',
    'stories.title': '이야기 목록', 'stories.sub': '신화·전설 {n}편', 'stories.search': '이름·장소로 검색', 'stories.none': '맞는 이야기가 없어요',
    'stories.sub2': '신화·민담 {n}편 · 대표 이야기 {f}편', 'stories.all': '전체', 'stories.featured': '대표 이야기',
    'stories.searchTip': '검색하기', 'stories.kw': '키워드', 'stories.more': '더 보기', 'stories.groupAll': '모두', 'stories.search2': '제목·키워드로 검색',
    'stories.note': '제주도청 OpenAPI 는 제목·분류·핵심어만 제공해요. 원문(PDF·전자책) 링크는 현재 열리지 않아 본문은 대표 이야기에만 있어요.',
    'stories.err': '신화·민담 목록을 불러오지 못했어요',
    'modal.close': '닫기', 'modal.tags': '핵심어', 'modal.tagHint': '핵심어를 누르면 그 낱말로 관련 장소를 다시 찾아요',
    'modal.saved': '수첩에 담았어요', 'modal.findSame': '목록에서 비슷한 이야기 찾기',

    'detail.back': '지도로', 'detail.note': '신화는 전승에 따라 내용이 조금씩 달라요.', 'detail.save': '＋ 내 수첩에 담기',
    'detail.places': '이야기의 무대', 'detail.placesSrc': '한국관광공사', 'detail.noPlaces': '관련 장소가 없어요',
    'detail.heritage': '국가유산', 'detail.heritageSrc': '국가유산청', 'detail.noHeritage': '관련 유산이 없어요',
    'detail.heritageNote': '', 'detail.copy': '주소 복사', 'toast.copied': '주소를 복사했어요', 'toast.copyfail': '복사하지 못했어요',

    'guide.title': 'Ask', 'guide.sub': '이야기·장소·날씨·유산 도구를 스스로 골라 쓰는 AI 에이전트',
    'guide.example': '예) “산방산 전설 들려주고, 오늘 서귀포 날씨에 가도 괜찮을지 알려줘”',
    'guide.loading': '안내자가 도구를 쓰는 중…', 'modal.source': '원문 찾아보기', 'modal.sourceHint': '도청 원문 링크가 열리지 않아 웹 검색으로 연결해요',
    'guide.try': '이런 걸 물어볼 수 있어요', 'guide.s1': '산방산 전설을 들려줘', 'guide.s2': '설문대할망은 누구야?', 'guide.s3': '오늘 서귀포 날씨에 가기 좋은 이야기 장소는?', 'guide.s4': '용두암 근처에서 볼 만한 곳 알려줘',
    'ask.title': '궁금한 건\n바로 물어보세요', 'ask.lede': 'Ask는 이야기·장소·날씨·국가유산 도구를 스스로 골라 쓰는 AI 안내자예요. 신화를 찾고, 오늘 날씨를 보고, 가 볼 만한 곳까지 이어서 답해 줘요.', 'ask.cta': 'Ask 열기',
    'ask.demoQ': '산방산 전설을 들려주고, 오늘 가도 괜찮을지 알려줘', 'ask.step1': '이야기 찾기 · 산방산', 'ask.step2': '날씨 확인 · 서귀포시', 'ask.step3': '관광 장소 · Sanbangsan',
    'ask.demoA': '사냥꾼의 화살에 노한 옥황상제가 한라산 꼭대기를 뽑아 던졌고, 그것이 산방산이 되었다고 전해져요. 오늘 서귀포는 비 소식이 없어서 가 보기 좋아요. 산방산 유람선도 함께 들러 보세요.', 'ask.note': '예시 화면이에요. 실제 답은 Ask에서 확인하세요.',
    'guide.ph': '무엇이든 물어보세요', 'guide.send': '보내기',
    'tool.get_story': '이야기', 'tool.search_tour_places': '관광 장소', 'tool.get_weather': '날씨', 'tool.search_heritage': '국가유산',

    'nb.title': '내 수첩', 'nb.sub': '{who} 님이 담은 이야기 · Supabase 에 저장',
    'nb.nosb': 'Supabase 설정이 필요해요 — 로컬은 .env.local(저장 후 서버 재시작), 배포는 Vercel 환경변수(저장 후 재배포)', 'nb.empty': '아직 담은 이야기가 없어요. 이야기 상세에서 ＋ 내 수첩에 담기를 눌러 보세요',
    'home.nbDone': '내 수첩에 기록되었어요 :)', 'home.nbTitle': '마음에 드는 이야기에\n하트를 눌러 보세요', 'home.nbOpen': '내 수첩 열기', 'home.shuffle': '다른 이야기 보기',
    'nb.progress': '{done} / {total} 곳 다녀왔어요', 'nb.memoph': '메모 추가…', 'nb.heart': '수첩에 담기',
    'nb.visited': '✅ 가 봤어요', 'nb.notyet': '아직 안 가 봤어요', 'nb.visit': '가 봤어요', 'nb.cancel': '취소', 'nb.del': '삭제',

    'nf.title': '길을 잃었어요', 'nf.text': '없는 주소예요. 홈에서 다시 출발해 보세요.', 'nf.home': '홈으로',
    'wx.loading': '날씨 확인 중…', 'wx.fail': '날씨를 불러오지 못했어요', 'wx.pop': '강수',
    loading: '불러오는 중…', empty: '결과가 없어요',
    'toast.nosb': 'Supabase 설정이 필요해요 — 로컬은 .env.local(저장 후 서버 재시작), 배포는 Vercel 환경변수(저장 후 재배포)', 'toast.dup': '이미 수첩에 있어요', 'toast.saved': "'{title}' 수첩에 담았어요",
  },
  en: {
    announce: 'Browse Jeju’s myths, legends and folktales, and save them to your notebook',
    brand: 'Jeju Story Archive',
    'nav.home': 'Home', 'nav.map': 'Story Map', 'nav.stories': 'Stories', 'nav.notebook': 'Notebook',
    'nav.ask': 'Ask',
    'intro.skip': 'Skip', 'intro.hint': 'Scroll or tap to peel the notes away', 'intro.label': 'Notes from Jeju’s stories',
    'chat.refresh': 'Start a new chat', 'chat.close': 'Close', 'chat.error': 'Could not get an answer',
    anon: 'Guest',
    footer: 'Data: Korea Meteorological Administration · Korea Tourism Organization · Korea Heritage Service (data.go.kr) · Myths vary by telling; summaries are for learning.',

    'home.h1a': 'Jeju’s stories,', 'home.h1pre': 'to read and ', 'home.h1em': 'keep', 'home.h1post': '',
    'home.cta': 'BROWSE THE ARCHIVE',
    'home.display': 'Stories, told slowly,\nwith their places.', 'home.lede': 'Start with today’s story.',
    'auth.guest': 'Continue as Guest', 'auth.login': 'Log in', 'auth.signup': 'Sign up', 'auth.tLogin': 'Welcome back', 'auth.tSignup': 'Walk with us', 'auth.sLogin': 'Log in and your notebook follows you anywhere.', 'auth.sSignup': 'Create an account to keep your saved stories and notes.', 'auth.google': 'Continue with Google', 'auth.or': 'or', 'auth.email': 'Email', 'auth.password': 'Password', 'auth.nick': 'Nickname', 'auth.nickph': 'Name for your notebook', 'auth.goLogin': 'Log in', 'auth.goSignup': 'Sign up', 'auth.toSignup': 'No account yet?', 'auth.toLogin': 'Already have an account?', 'auth.checkmail': 'We sent a confirmation email. Open the link in it to finish signing up.', 'auth.nosb': 'Supabase setup is required (.env.local)', 'auth.logout': 'Log out', 'auth.account': 'My account', 'auth.admin': 'Admin', 'auth.pw': 'Password must be at least 6 characters', 'auth.welcome': 'Welcome, {name}', 'auth.bye': 'Logged out', 'auth.busy': 'One moment…',
    'map.sub': "Add the places that hold your own story to the island of myths", 'map.add': "Add a place", 'map.addSub': "Leave a name, a short story and a drawing, and a pin appears on the map.", 'map.mine': "Places with my story", 'map.none': "No places added yet", 'map.name': "Place name", 'map.nameph': "e.g. Grandma’s tangerine grove", 'map.memo': "My story", 'map.memoph': "A short note about this place", 'map.cat': "Type", 'map.catAll': "All types", 'map.addr': "Search address", 'map.addrph': "Address or place name (in Jeju)", 'map.find': "Search", 'map.noresult': "No results. Try different words.", 'map.draw': "Cover drawing", 'map.drawHint': "Draw with your finger or mouse", 'map.undo': "Undo", 'map.clear': "Clear", 'map.save': "Save", 'map.cancel': "Cancel", 'map.del': "Delete", 'map.sample': "Example", 'map.local': "The Supabase table (my_places) doesn’t exist yet, so places are saved on this device only. Run supabase-places.sql to share them.", 'map.saved': "Place added", 'map.needName': "Please enter a place name", 'map.lore': 'Places with Jeju’s stories', 'home.addStory': 'Add your story',
    'chat.save': "Save to notebook", 'chat.saved': "Saved", 'chat.share': "Share", 'chat.copied': "Copied to clipboard", 'chat.copyFail': "Could not copy", 'chat.shareHead': "Jeju Story Archive · Ask", 'nb.more': "More", 'nb.less': "Less",
    'home.today': 'TODAY', 'home.read': 'READ', 'home.more': 'READ MORE',
    'home.statement': 'We reconnect the tales with the land that gave them birth.\n\nWalking past Hallasan, rocks, caves and village shrines,\nwe meet the places where the stories began, and the time they carry.\n\nBeyond reading, we experience stories rooted in the ground.',
    'home.storiesTitle': 'Tales carried across the island', 'home.storiesSub': 'Jeju tales, previewed\nby keyword',
    'home.telling': 'Our way of telling is about restoring the connection between a story and the ground it came from. It’s remembering that Hallasan, a stone, a cave or a village shrine were never just scenery. They are where the tale began. It’s seeing today’s weather, the places that still carry its name and the heritage that kept it alive, and then walking there. It’s growing a love for stories rooted in place, and knowing where a tale really comes from.',
    'home.ask': 'ASK THE GUIDE', 'home.status': 'Setup status',
    'home.nick': 'Nickname', 'home.nickph': 'Enter a nickname', 'home.nickhint': 'Your notebook is saved under this nickname.',
    'check.react': 'React · Router', 'check.react.ok': 'If you see this page, it works',
    'check.wait': 'Checking…', 'check.ok': 'Connected',
    'check.sbfail': 'Add the Supabase values to .env.local',
    'check.apifail': 'Run with vercel dev, not npm run dev',

    'map.title': 'Myth Map', 'map.selected': 'Selected story',
    'stories.title': 'All stories', 'stories.sub': '{n} myths and legends', 'stories.search': 'Search by name or place', 'stories.none': 'No matching stories',
    'stories.sub2': '{n} myths & folktales · {f} featured stories', 'stories.all': 'All', 'stories.featured': 'Featured',
    'stories.searchTip': 'Search', 'stories.kw': 'Keywords', 'stories.more': 'MORE', 'stories.groupAll': 'All', 'stories.search2': 'Search titles & keywords',
    'stories.note': 'The Jeju provincial OpenAPI only provides titles, categories and keywords. Its full-text PDF/e-book links currently do not open, so full texts exist only for the featured stories. Titles are translated automatically; keywords stay in Korean.',
    'stories.err': 'Could not load the myth and folktale list',
    'modal.close': 'Close', 'modal.tags': 'Keywords', 'modal.tagHint': 'Tap a keyword to search related places with that word',
    'modal.saved': 'Saved to notebook', 'modal.findSame': 'Find similar stories in the list',

    'detail.back': 'Back to map', 'detail.note': 'Myths differ a little from one telling to another.', 'detail.save': '＋ Add to my notebook',
    'detail.places': 'Where it happened', 'detail.placesSrc': 'Korea Tourism Organization', 'detail.noPlaces': 'No related places found',
    'detail.heritage': 'National heritage', 'detail.heritageSrc': 'Korea Heritage Service', 'detail.noHeritage': 'No related heritage found',
    'detail.heritageNote': 'Names are translated from the Korean source.', 'detail.copy': 'Copy address', 'toast.copied': 'Address copied', 'toast.copyfail': 'Could not copy',

    'guide.title': 'Ask', 'guide.sub': 'An AI agent that picks its own tools: stories, places, weather and heritage',
    'guide.example': 'e.g. “Tell me the Sanbangsan legend and whether Seogwipo’s weather is good for a visit today”',
    'guide.loading': 'The guide is using its tools…', 'modal.source': 'Find the story online', 'modal.sourceHint': 'The official full-text links no longer open, so this searches the web',
    'guide.try': 'Try asking', 'guide.s1': 'Tell me the legend of Sanbangsan', 'guide.s2': 'Who is Grandmother Seolmundae?', 'guide.s3': 'Which story places suit today’s weather in Seogwipo?', 'guide.s4': 'What is worth seeing near Yongduam?',
    'ask.title': 'Just ask,\nright away', 'ask.lede': 'Ask is an AI guide that picks its own tools: stories, places, weather and heritage. It finds the myth, checks today’s weather and suggests where to go, all in one answer.', 'ask.cta': 'OPEN ASK',
    'ask.demoQ': 'Tell me the Sanbangsan legend and whether it is a good day to go', 'ask.step1': 'Finding the story · Sanbangsan', 'ask.step2': 'Checking weather · Seogwipo', 'ask.step3': 'Looking up places · Sanbangsan',
    'ask.demoA': 'A hunter’s arrow angered the Jade Emperor, who tore off the peak of Hallasan and threw it down; it became Sanbangsan. No rain is expected in Seogwipo today, so it is a good day to visit. You could also stop by the Sanbangsan boat tour.', 'ask.note': 'This is a sample. Open Ask for a real answer.',
    'guide.ph': 'Ask anything', 'guide.send': 'SEND',
    'tool.get_story': 'Story', 'tool.search_tour_places': 'Places', 'tool.get_weather': 'Weather', 'tool.search_heritage': 'Heritage',

    'nb.title': 'My Notebook', 'nb.sub': 'Stories saved by {who} · stored in Supabase',
    'nb.nosb': 'Supabase setup is required — locally in .env.local (restart the server), on Vercel as environment variables (redeploy)', 'nb.empty': 'Nothing saved yet. Open a story and tap “Add to my notebook”.',
    'home.nbDone': 'Saved to your notebook :)', 'home.nbTitle': 'Tap the heart on\nthe stories you like', 'home.nbOpen': 'Open my notebook', 'home.shuffle': 'Show others',
    'nb.progress': '{done} / {total} visited', 'nb.memoph': 'Add a note…', 'nb.heart': 'Add to notebook',
    'nb.visited': '✅ Visited', 'nb.notyet': 'Not visited yet', 'nb.visit': 'VISITED', 'nb.cancel': 'UNDO', 'nb.del': 'DELETE',

    'nf.title': 'You’re lost', 'nf.text': 'That page doesn’t exist. Start again from home.', 'nf.home': 'HOME',
    'wx.loading': 'Checking weather…', 'wx.fail': 'Could not load weather', 'wx.pop': 'rain',
    loading: 'Loading…', empty: 'No results',
    'toast.nosb': 'Supabase setup is required — locally in .env.local (restart the server), on Vercel as environment variables (redeploy)', 'toast.dup': 'Already in your notebook', 'toast.saved': "Saved '{title}' to your notebook",
  },
  es,
  de,
}

export function translate(lang, key, vars) {
  let s = STR[lang]?.[key] ?? STR.en[key] ?? STR.ko[key] ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v)
  return s
}

export { STR }
