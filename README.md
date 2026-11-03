# 제주 이야기 아카이브 (Jeju Story Archive)

제주의 신화·전설·민담 **408편**을 열람하고, 이야기가 태어난 장소로 찾아가고, **내 제주 이야기를 그 위에 더하는** 웹 아카이브입니다.
읽고(Stories) → 찾아가고(Story Map · 3D Island · 가는 길 카드) → 기록하고(Notebook · Photo Booth) → 물어보는(Ask) 흐름을 하나로 이었습니다.

## 기획 의도

| | |
|---|---|
| **누구에게** | 제주 이야기를 알고 싶은 여행자와 학생, 특히 한국어가 서툰 외국인 방문자 |
| **어떤 가치** | ① 흩어진 설화 데이터를 한곳에서 읽고(번역·발음·용어 풀이 포함) ② 이야기의 무대로 실제로 찾아갈 수 있게 날씨·관광지·국가유산을 이어 주고 ③ 내가 다녀온 곳과 그림·사진·메모를 이야기 위에 더해 **나만의 제주 기록**으로 남김 |
| **차별점** | “이야기가 많은 제주에 내 이야기를 더한다” — 신화 핀과 내 장소가 같은 지도·같은 3D 섬 위에 놓임 |

## 기능

| 화면 | 내용 |
|---|---|
| Home | 종이 메모 인트로(2번 넘기면 시작) → 타이핑 히어로 → 소개 → 대표 이야기 → Ask 소개 → 하트로 담는 내 수첩 |
| Stories | 민담 310 · 신화 98 접이식 목록, 분류 드롭다운, 검색, 이야기 팝업(번역된 핵심어·로마자·발음·이야기의 무대·원문 찾기) |
| Story Map | 실제 제주 지도 위에 신화 핀 6곳 + **내 이야기 장소**(주소 검색·대표 그림·종류·메모, 예시 5곳, 수정·삭제) |
| Island (3D) | Three.js 낮은 폴리곤 제주 섬: 핀, 해녀·한라봉·흑돼지·돌하르방·올레길 여행자, **내 캐릭터 + 말풍선**, 인스타그램용 사진 |
| Notebook | 색색의 메모지·단어 카드·사진 카드가 흩어진 수첩(옆으로 넘김 / 리스트로 보기), 북마크, 이미지로 저장·공유 |
| Your Helper | 제주 문화 용어·제주어 49개 풀이(발음 듣기, 수첩에 담기) |
| Photo Booth | 폰 카메라로 3컷 → 두들 프레임 4색 · 필터 3종 · 스티커 23종 → 세로 사진 띠 저장·공유 |
| Ask (모달) | Gemini 에이전트 — 도구 4개를 스스로 골라 호출, 호출 내역 표시, 답변을 수첩에 저장·공유 |
| 로그인 | 이메일 · Google · Guest (Supabase Auth). 헤더 카메라 아이콘 = Photo Booth |

언어: 한국어 · English · Español · Deutsch (헤더 KO/EN/ES/DE).

## 사용한 API

| API | 용도 | 위치 |
|---|---|---|
| 기상청 단기예보 (공공데이터포털) | 날씨 칩, 에이전트 `get_weather` | `server/weather.js` · `api/weather.js` |
| 한국관광공사 국문 관광정보 | 이야기의 무대·가는 길 | `server/tour.js` · `api/tour.js` |
| 한국관광공사 영문 관광정보 | 영어·스페인어·독일어 화면의 장소 | `server/tourEng.js` · `api/tour-en.js` |
| 국가유산청 국가유산 | 이야기 근처 유산, 에이전트 `search_heritage` | `server/heritage.js` · `api/heritage.js` |
| 제주도청 설화·신화·민담 OpenAPI (E07/E08/E09) | 408편 목록 | `server/folk.js` · `api/catalog.js` |
| OpenStreetMap Nominatim | 내 장소 주소 검색 (키 불필요, 브라우저에서 직접 호출) | `src/lib/places.js` |
| Google Gemini | Ask 에이전트, 장소·유산 이름 번역 | `server/gemini.js` · `api/agent.js` · `api/translate.js` |

Gemini는 모델이 바쁘면(503·429) 다음 모델로 **자동 재시도**합니다(`GEMINI_FALLBACK_MODELS`).

## Supabase

| 테이블 / 저장소 | 내용 | SQL |
|---|---|---|
| `saved_stories` | 수첩(이야기·단어·Ask 답변·사진 카드), 북마크, 메모 | `supabase.sql` |
| `my_places` | 지도에 더한 내 장소(그림 포함) | `supabase-places.sql` |
| `island_characters` | 3D 섬의 내 캐릭터와 말풍선 | `supabase-characters.sql` |
| Storage `notebook-photos` | 수첩에 담은 사진(작게 줄여 저장) | `supabase-photos.sql` |
| Auth | 이메일 · Google · Guest | 대시보드 설정 |

SQL Editor 에서 위 파일을 순서대로 실행합니다(여러 번 실행해도 안전). 표가 없으면 장소·캐릭터는 이 기기에만 저장되는 모드로 동작합니다.
> 지금 권한 정책은 로그인 없이 쓰는 학습용(누구나 읽기·쓰기)입니다. 실서비스 전에는 `owner = auth.uid()` 로 묶어야 합니다.

## 실행

```bash
npm install
cp .env.example .env.local     # 값 채우기 (아래 표)
vercel dev                     # 화면 + /api 서버 함수 (npm run dev 는 화면만)
```

| 변수 | 쓰는 곳 | 브라우저에 노출? |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase 연결 (공개용 anon 키) | 예 (공개 키라 정상) |
| `DATA_GO_KR_KEY`, `TOUR_ENG_KEY`, `TOUR_ENG_BASE` | 공공데이터 | **아니오** — `/api` 서버 함수에서만 |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_FAST_MODEL`, `GEMINI_FALLBACK_MODELS` | Gemini | **아니오** |

Vercel 배포 시 같은 변수를 Project Settings → Environment Variables 에 넣고 재배포합니다(`GEMINI_MODEL` 계열은 `gemini-flash-lite-latest` 권장). 배포 보호(Vercel Authentication)가 켜져 있으면 공개 주소가 로그인 화면으로 가므로 꺼야 합니다.

## 구조

```
api/        Vercel 서버 함수 — 비밀 키는 여기서만 (agent, translate, catalog, tour, tour-en, weather, heritage, hello)
server/     공공데이터·Gemini 호출 함수 (api/ 와 에이전트가 함께 사용)
src/
  router.jsx · layouts/   메뉴와 공통 틀 (Island · Booth 는 필요할 때만 불러오는 lazy 라우트)
  store/useAppStore.js    전역 상태: 닉네임·언어·로그인·알림·내 수첩·내 장소·안내자 대화
  pages/                  Home · Stories · StoryDetail · MapPage · Island · Notebook · Helper · Booth
  components/             공용: Modal · PageHeader · Status(로딩/에러/빈 결과) · StoryCard · GoModal · SpeakButton · DrawPad …
  lib/                    stories · folk · places · characters · photos · romanize · booth · islandTerrain/islandProps · i18n …
  data/                   stories.json · folk-*.json(분류·제목·핵심어 번역) · glossary.js · jeju-mask.json
scripts/    translate-tags.mjs(핵심어 번역), make-jeju-mask.py(3D 섬 윤곽 만들기)
```
전역 상태는 `useAppStore`(여러 페이지가 공유), 입력창·탭·모달 같은 값은 각 페이지의 `useState` 로 구분했습니다.

## 평가 기준 체크리스트 (100점 + 가산점)

“확인”은 실제로 실행해서 본 결과입니다. 배포본에서 보이는지는 Vercel 환경변수 설정 후 직접 확인이 필요합니다.

| 항목 | 배점 | 근거 | 상태 |
|---|---|---|---|
| React 구조 | 15 | Router(`router.jsx`) · Store(`useAppStore`) · 공용 컴포넌트 재사용(Modal, StoryCard, Status, GoModal …) · 전역/지역 상태 구분 | 구현 |
| 공공 API 3개 이상 | 20 | 기상청·관광공사(국/영문)·국가유산청·제주도청 — 로컬에서 5개 모두 실제 데이터 응답 확인(날씨 시간별 예보, 관광지, 유산 8건, 설화 408건). `Status` 컴포넌트로 로딩·에러 표시 | 로컬 확인 · 배포본 확인 필요 |
| Supabase | 15 | 수첩·내 장소·캐릭터·사진 저장/조회/수정/삭제, 새로고침 후에도 유지 | 확인 (SQL 4개 실행 필요) |
| AI 에이전트 | 25 | 도구 4개(`get_story`·`search_tour_places`·`get_weather`·`search_heritage`). “산방산 전설 알려주고 근처 날씨도” → `get_story` → `get_weather` 연속 성공. 화면에 호출 내역 표시. “없는 신화”를 물으면 데이터에 없다고 답함(지어내지 않음) | 확인 |
| 제주 IP 기획 | 10 | 위 “기획 의도” — 대상(여행자·외국인)과 가치(읽기→찾아가기→내 기록) | 구현 |
| 배포·보안 | 10 | 비밀 키(Gemini·공공데이터)는 `dist`, 추적 파일, 전체 git 이력(36개 커밋) 어디에도 없음을 검색으로 확인. 브라우저에는 공개용 Supabase 키만. 최신 커밋의 Vercel 배포 `success` | 확인 · 공개 주소는 보호 해제 필요 |
| README·발표 | 5 | 이 문서 + 아래 시연 순서 | **테스트 캡처 추가 필요** |
| 가산점 | +10 | Three.js 3D 섬(+5) · API 5종 이상 · Ask 답변을 Supabase 수첩에 저장 · 로그인(이메일·Google·Guest)(+5) | 구현 |

## 에이전트 테스트 문장
- “산방산 전설 알려주고, 그 근처 오늘 날씨도 알려줘” → 이야기 → 날씨 (연속 호출)
- “오늘 서귀포 날씨 보고 갈 만한 신화 장소 추천해줘” → 날씨 → 이야기 → 장소
- “‘황금 바다 용왕과 일곱 돌고래’ 신화 알려줘” → 데이터에 없으면 없다고 답하는지 (지어내기 테스트)

## 시연 순서 (3분)
1. **Home** — 종이 인트로를 2번 넘기면 타이핑 히어로 → 소개 → 하트로 수첩에 담기
2. **Stories** — 민담 펼치기 → 이야기 팝업(번역·발음) → “Find the story online”
3. **Story Map** — 신화 핀 + 내 장소 추가(주소 검색·그림) → 핀 말풍선
4. **Island** — 3D 섬 돌려 보기 → 해녀·돌하르방 눌러 설명 → 내 캐릭터 세우기 → 사진
5. **Ask** — 위 테스트 문장으로 도구 호출 내역 확인 → 답변을 수첩에 저장
6. **Notebook** — 흩어진 메모지 → 리스트로 보기 → 이미지로 공유
7. **Photo Booth** — 3컷 → 프레임·스티커 → 저장

## 알려진 한계
- 제주도청 OpenAPI는 제목·분류·핵심어만 주고 본문 링크가 열리지 않아, 본문은 대표 이야기 6편에만 있습니다(나머지는 “원문 찾아보기” 검색 링크).
- 번역(핵심어 1,702개·제목 408개·용어 풀이)은 AI 초안이라 제주 고유명사는 원어민 검수가 필요합니다.
- Google 검색 연결 요약은 Gemini 유료 요금제가 필요해 넣지 않았습니다.
