# 신화지도 · 제주 신화·전설 지도

제주의 신화·전설을 지도 위에 올리고, 이야기가 시작된 장소의 **날씨·관광지·국가유산**을 이어 붙여 직접 찾아가게 돕는 서비스.
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
