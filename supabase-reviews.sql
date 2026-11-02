-- Supabase 대시보드 > SQL Editor > New query 에 전체를 붙여 넣고 Run
-- 여러 번 실행해도 오류 없이 같은 결과가 나오도록 만들었어요. (샘플 후기는 한 번만 들어가요)

-- ① 후기 테이블 (이름이 place_reviews 인 이유: 이 프로젝트에 이미 있는 reviews 테이블(다른 실습)과 겹치지 않게)
create table if not exists public.place_reviews (
  id           bigint generated always as identity primary key,
  nickname     text        not null,                       -- 작성자 닉네임 (없으면 '익명')
  place_id     text,                                       -- 한국관광공사 장소 id (contentid)
  place_title  text        not null,                       -- 다녀온 장소 이름
  place_addr   text,                                       -- 장소 주소
  story_id     text,                                       -- 연결된 이야기 (선택)
  rating       smallint    not null check (rating between 1 and 5),   -- 별점 1~5
  recommend    boolean     not null default false,         -- 추천 여부
  comment      text,                                       -- 한마디 (선택)
  image_url    text,                                       -- 올린 사진 주소 (선택)
  is_sample    boolean     not null default false,         -- 샘플 후기 표시
  created_at   timestamptz not null default now()
);

create index if not exists place_reviews_created_idx on public.place_reviews (created_at desc);

alter table public.place_reviews enable row level security;

-- 로그인 없이 쓰는 학습용 정책: 누구나 읽기·쓰기·삭제 가능
-- (실제 서비스라면 로그인(auth.uid())과 묶어서 본인 후기만 지우게 바꿔야 해요)
drop policy if exists "place_reviews anon all" on public.place_reviews;
create policy "place_reviews anon all" on public.place_reviews for all using (true) with check (true);

grant select, insert, update, delete on public.place_reviews to anon, authenticated;

-- ② 사진 저장소(Storage 버킷): 공개 읽기, 5MB 이하 이미지(jpg/png/webp)만
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('place-review-photos', 'place-review-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "place review photos read" on storage.objects;
create policy "place review photos read" on storage.objects
  for select using (bucket_id = 'place-review-photos');

drop policy if exists "place review photos upload" on storage.objects;
create policy "place review photos upload" on storage.objects
  for insert with check (bucket_id = 'place-review-photos');

-- ③ 샘플 후기 6개 (이미 샘플이 있으면 넣지 않음)
insert into public.place_reviews (nickname, place_title, place_addr, story_id, rating, recommend, comment, image_url, is_sample, created_at)
select * from (values
    ('지은', '삼성혈', '제주특별자치도 제주시 이도동', 'samseonghyeol', 5, true, '세 개의 구멍을 직접 보니 신화가 훨씬 가깝게 느껴졌어요. 한적한 오전에 가길 추천해요.', null, true, '2026-10-30T09:20:00+09:00'::timestamptz),
    ('Emma (UK)', 'Sanbangsan', 'Andeok-myeon, Seogwipo-si, Jeju-do', 'sanbangsan', 5, true, 'Loved hearing the legend of the peak that flew here from Hallasan. Go on a clear day for the views.', null, true, '2026-10-27T14:05:00+09:00'::timestamptz),
    ('민호', '용두암', '제주특별자치도 제주시 용담동', 'yongduam', 3, false, '공항에서 가까워서 들르기 좋지만 낮에는 사람이 많아요. 일출이나 이른 아침이 나을 것 같아요.', null, true, '2026-10-24T11:40:00+09:00'::timestamptz),
    ('하린', '한라산 영실', '제주특별자치도 서귀포시', 'seolmundae', 5, true, '오백장군 이야기를 알고 걸으니 바위 하나하나가 달리 보였어요. 날씨 확인하고 가세요!', '/samples/hero.jpg', true, '2026-10-21T08:10:00+09:00'::timestamptz),
    ('수빈', '송당리 본향당', '제주특별자치도 제주시 구좌읍 송당리', 'songdang', 4, true, '마을 신 이야기를 읽고 가니 조용한 숲길이 다르게 느껴졌어요. 표지판이 조금 더 있으면 좋겠어요.', null, true, '2026-10-18T16:30:00+09:00'::timestamptz),
    ('Tom (US)', 'Manjanggul Cave', 'Gujwa-eup, Jeju-si, Jeju-do', 'gimnyeonggul', 4, true, 'Spooky in a good way after reading the serpent tale of Gimnyeong. Bring a jacket, it is cold inside.', null, true, '2026-10-15T13:15:00+09:00'::timestamptz)
) as v(nickname, place_title, place_addr, story_id, rating, recommend, comment, image_url, is_sample, created_at)
where not exists (select 1 from public.place_reviews where is_sample);
