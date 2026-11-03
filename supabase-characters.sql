-- Supabase 대시보드 > SQL Editor > New query 에 전체를 붙여 넣고 Run
-- 3D 섬에 세워 두는 "내 캐릭터" 표. 여러 번 실행해도 오류 없이 같은 결과가 나옵니다.

create table if not exists public.island_characters (
  id          bigint generated always as identity primary key,
  owner       text             not null,                 -- 로그인한 사용자 id, 로그인 전이면 이 기기의 임시 id
  type        text             not null,                 -- pig | tangerine | horse | cat | man | woman
  x           double precision not null,                 -- 지도 좌표 (Story Map 과 같은 좌표계)
  y           double precision not null,
  msg         text             not null default '',      -- 말풍선에 띄우는 한마디
  created_at  timestamptz      not null default now()
);

create index if not exists island_characters_owner_idx on public.island_characters (owner, created_at);

alter table public.island_characters enable row level security;

-- 로그인 없이 쓰는 학습용 정책: 누구나 읽기·쓰기·삭제 가능 (실서비스라면 owner = auth.uid() 로 묶어야 해요)
drop policy if exists "anon all" on public.island_characters;
create policy "anon all" on public.island_characters for all using (true) with check (true);

grant select, insert, update, delete on public.island_characters to anon, authenticated;
