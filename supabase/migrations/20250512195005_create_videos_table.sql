-- 1) Cria a tabela videos
create table public.videos (
  id              uuid                   primary key default gen_random_uuid(),
  user_id         uuid                   not null references public.profiles(id) on delete cascade,
  title           text                   not null,
  description     text,
  video_path      text                   not null,
  thumbnail_path  text                   not null,
  created_at      timestamp with time zone default now() not null
);

-- 2) Habilita Row Level Security
alter table public.videos enable row level security;

-- 3) Policy de INSERT: só o dono pode inserir
create policy "Insert own videos" on public.videos
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- 4) Policy de SELECT: só o dono pode ler
create policy "Select own videos" on public.videos
  for select
  to authenticated
  using (user_id = auth.uid());
