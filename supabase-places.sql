-- Supabase 대시보드 > SQL Editor > New query 에 전체를 붙여 넣고 Run
-- 지도에 더하는 "내 이야기 장소" 표. 여러 번 실행해도 오류 없이 같은 결과가 나옵니다.

create table if not exists public.my_places (
  id          bigint generated always as identity primary key,
  owner       text             not null,                 -- 로그인한 사용자 id, 로그인 전이면 이 기기의 임시 id
  name        text             not null,                 -- 장소 이름
  memo        text             not null default '',      -- 나의 이야기(짧은 메모)
  category    text             not null default 'etc',   -- restaurant | cafe | stay | sight | nature | shop | etc
  address     text             not null default '',      -- 검색해서 고른 주소
  lat         double precision,                          -- 지도에 찍을 위도·경도 (없으면 목록에만 보임)
  lng         double precision,
  drawing     text             not null default '',      -- 대표 그림: 선 하나하나를 담은 SVG path (viewBox 0 0 200 200)
  created_at  timestamptz      not null default now()
);

create index if not exists my_places_owner_idx on public.my_places (owner, created_at desc);

alter table public.my_places enable row level security;

-- 로그인 없이 쓰는 학습용 정책: 누구나 읽기·쓰기·삭제 가능
-- (그림은 랜딩 인트로에서 다른 사람에게도 보여 주려고 일부러 열어 둠. 실서비스라면 owner = auth.uid() 로 묶고, 그림만 따로 공개)
drop policy if exists "anon all" on public.my_places;
create policy "anon all" on public.my_places for all using (true) with check (true);

grant select, insert, update, delete on public.my_places to anon, authenticated;
