-- Supabase 대시보드 > SQL Editor > New query 에 전체를 붙여 넣고 Run
-- 여러 번 실행해도 오류 없이 같은 결과가 나오도록 만들었어요.

-- 내 수첩: 닉네임별로 담은 이야기와 '가 봤어요' 표시
create table if not exists public.saved_stories (
  id          bigint generated always as identity primary key,
  nickname    text        not null,                 -- 홈에서 입력한 닉네임 (없으면 '익명')
  story_id    text        not null,                 -- 대표 이야기 id(seolmundae …) 또는 신화·민담 코드(T_M_001 …)
  title       text        not null,                 -- 담을 때의 제목
  visited     boolean     not null default false,   -- '가 봤어요'
  created_at  timestamptz not null default now(),
  unique (nickname, story_id)                       -- 같은 이야기는 한 번만 담김
);

-- 닉네임으로 목록을 불러오므로 인덱스
create index if not exists saved_stories_nickname_idx on public.saved_stories (nickname, created_at desc);

-- 행 단위 보안(RLS) 켜기
alter table public.saved_stories enable row level security;

-- 로그인 없이 쓰는 학습용 정책: 누구나 읽기·쓰기·수정·삭제 가능
-- (실제 서비스라면 로그인(auth.uid())과 묶어서 본인 행만 다루게 바꿔야 해요)
drop policy if exists "anon all" on public.saved_stories;
create policy "anon all" on public.saved_stories
  for all
  using (true)
  with check (true);

-- 공개용(anon) 키로 접근할 수 있도록 권한 부여
grant select, insert, update, delete on public.saved_stories to anon, authenticated;
