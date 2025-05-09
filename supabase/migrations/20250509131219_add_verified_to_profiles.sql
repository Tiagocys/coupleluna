-- adiciona coluna para marcar aprovação de documento
alter table public.profiles
add column verified boolean default false not null;
