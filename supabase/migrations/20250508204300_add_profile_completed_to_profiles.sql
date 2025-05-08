-- 1) Adiciona a coluna profile_completed
alter table public.profiles
add column profile_completed boolean default false not null;
