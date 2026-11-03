-- Supabase 대시보드 > SQL Editor > New query 에 전체를 붙여 넣고 Run
-- 노트에 담는 사진(포토부스·3D 섬)을 저장하는 칸과 저장소(bucket). 여러 번 실행해도 오류 없이 같은 결과가 나옵니다.

-- 1) 노트 항목에 사진 주소를 담는 칸
alter table public.saved_stories add column if not exists image text not null default '';

-- 2) 사진을 올릴 저장소: notebook-photos (공개 주소로 읽을 수 있음)
insert into storage.buckets (id, name, public)
values ('notebook-photos', 'notebook-photos', true)
on conflict (id) do nothing;

-- 3) 로그인 없이 쓰는 학습용 정책: 누구나 올리고·읽고·지울 수 있음 (실서비스라면 로그인한 본인 폴더만 쓰게 바꿔야 해요)
drop policy if exists "notebook photos read" on storage.objects;
create policy "notebook photos read" on storage.objects for select using (bucket_id = 'notebook-photos');

drop policy if exists "notebook photos insert" on storage.objects;
create policy "notebook photos insert" on storage.objects for insert with check (bucket_id = 'notebook-photos');

drop policy if exists "notebook photos delete" on storage.objects;
create policy "notebook photos delete" on storage.objects for delete using (bucket_id = 'notebook-photos');
