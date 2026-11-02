-- Supabase > SQL Editor 에 붙여 넣고 Run
create table if not exists saved_stories (
  id bigint generated always as identity primary key,
  nickname text not null,
  story_id text not null,
  title text not null,
  visited boolean not null default false,
  created_at timestamptz not null default now(),
  unique (nickname, story_id)
);

alter table saved_stories enable row level security;
-- 로그인 없이 쓰는 학습용 정책: 누구나 읽기·쓰기·수정·삭제 가능
create policy "anon all" on saved_stories for all using (true) with check (true);
