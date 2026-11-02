# 제주 아카이브 · 제주 신화·전설·민담 아카이브

제주의 신화·전설·민담 408편을 열람하고 내 수첩에 저장하는 아카이브. 신화 지도는 그중 하나의 기능이며, 이야기가 시작된 장소의 **날씨·관광지·국가유산**을 이어 붙여 직접 찾아가게 돕습니다.
**신화 데이터 + 공공데이터 3종 + Gemini 에이전트**로 구성했습니다.

## 실행
```bash
npm install
cp .env.example .env.local     # 값 채우기
vercel dev                     # 화면 + /api 서버 함수 (npm run dev 는 화면만)
```
Supabase: SQL Editor 에 `supabase.sql` 실행.

## 구조
```
api/      Vercel 서버 함수 — 비밀 키는 여기서만 (agent, tour, weather, heritage, hello)
server/   공공데이터·신화 데이터 호출 함수 (api/ 와 에이전트가 함께 사용)
src/
  router.jsx · layouts/   메뉴와 공통 틀
  store/useAppStore.js    전역 상태: 닉네임·알림·내 수첩(Supabase)·안내자 대화
  pages/                  Home · MapPage · Stories · StoryDetail(/stories/:id) · Guide · Notebook
  components/             IslandMap(SVG 지도) · StoryCard(재사용) · Status(로딩/에러/빈 결과) · WeatherChip …
  data/stories.json       신화·전설 6편 (학습용 요약 — 출처로 검증 후 확장)
```

## 랜딩 연출 (종이 조각 덮개)
1. 랜딩 사진 위를 **그림 윤곽대로 오린 종이 조각**이 3겹으로 덮고 있고, 스크롤·스와이프·방향키·클릭 **3번**에 한 겹씩 날아가며 랜딩이 드러납니다. (`건너뛰기` 버튼, Esc 로 바로 건너뜀)
2. 한 탭(세션)에서 **한 번만** 보여 줍니다. 다시 보려면 주소 끝에 `?intro=1`. 모션 줄이기 설정(`prefers-reduced-motion`)이면 건너뜁니다.
3. 랜딩 섹션 순서: 히어로 → 대표 이야기 → **Ask 소개(예시 대화가 저절로 재생)** → OUR TELLING → 준비 상태

| 무엇 | 어디 |
|---|---|
| 낙서 일러스트 13종 (코드로 그린 SVG) | `src/components/Doodle.jsx` — `ART` 에 그림, `BODY` 에 종이 윤곽, `DOODLES` 에 이름 |
| 종이 조각 덮개 | `src/components/IntroNotes.jsx` (`PEELS`=넘기는 횟수, `PAPER`=종이색) |
| Ask 소개 섹션 | `src/components/AskShowcase.jsx` (예시 문구는 `ask.*` 문구) |
| 종이 질감·연필 색 | `src/styles/theme.css` 의 `.paper`, `.doodle .c-*` |

## 언어 (한국어 · English · Español · Deutsch)
화면 오른쪽 위 KO / EN / ES / DE 버튼으로 바뀌고, 선택은 저장됩니다. 번역은 모두 미리 넣어 둔 파일이라 API 키 없이도 나옵니다.

| 무엇 | 어디 |
|---|---|
| 언어 목록 | `src/lib/langs.js` |
| 화면 문구 (키 135개) | `src/lib/i18n.js` (ko·en), `src/locales/es.js`, `src/locales/de.js` — 빠진 키는 영어로 대신 나옴 |
| 대표 이야기 6편 | `src/data/stories.json`(한국어 원문) + `src/data/stories-i18n.json`(en·es·de) |
| 분류·키워드 | `src/data/folk-groups.json` (키워드는 `[한국어, 영어, 스페인어, 독일어]`) |
| 신화·민담 제목 408건 | `src/data/folk-titles.json` (`{ 한국어제목: { en, es, de } }`) |
| 장소·국가유산 이름 | 실시간 번역 `/api/translate` (Gemini) — 실패하면 원문 |

새 언어 추가: ① `langs.js` 에 한 줄 ② `src/locales/` 에 문구 파일 ③ `i18n.js` 의 `STR` 에 등록 ④ 위 데이터 파일마다 번역 추가.
번역은 초안이라 제주 고유명사(본풀이·지명)는 원어민 검수가 필요합니다. 스페인어·독일어의 관광정보는 영문 서비스를 대신 씁니다.

## 평가 기준 체크리스트 (100점 + 가산점)
| 항목 | 배점 | 이 프로젝트에서 | 상태 |
|---|---|---|---|
| React 구조 | 15 | Router(`router.jsx`) · Store(`useAppStore`) · 공용 `WordCard`/`Status` · 지역 상태는 페이지 `useState` | 구현 |
| 공공 API 3개 | 20 | 기상청(날씨 칩) · 관광공사·국가유산청(이야기 상세). 로딩·에러 처리 포함 | 키 입력 후 배포본에서 확인 |
| Supabase | 15 | `saved_stories` — 수첩 저장·조회·'가 봤어요' 수정·삭제, 새로고침 후 유지 | SQL 실행 후 확인 |
| AI 에이전트 | 25 | 도구 4개(이야기·장소·날씨·유산), 호출 내역 표시, 6턴 제한 | 키 입력 후 연속 호출 테스트 |
| 제주 IP 기획 | 10 | 신화 × 장소 탐방. 홈 문구를 기획 의도로 다듬기 | 문구 보완 필요 |
| 배포·보안 | 10 | 고정 주소 배포, 키는 `/api` 에서만, `.env.local` 은 git 제외 | 배포 필요 |
| README·발표 | 5 | 기획 의도·API·테스트 캡처·시연 | 캡처 추가 필요 |
| 가산점 | +10 | Three.js 3D 섬 화면(+5) · API 4개 이상/대화 기록 저장/로그인(+5) | 선택 |

## 에이전트 테스트 문장
- “산방산 전설 들려주고 그 근처 가 볼 곳 알려줘” → 이야기 → 장소 (연속 호출)
- “오늘 서귀포 날씨 보고 갈 만한 신화 장소 추천해줘” → 날씨 → 이야기 → 장소
