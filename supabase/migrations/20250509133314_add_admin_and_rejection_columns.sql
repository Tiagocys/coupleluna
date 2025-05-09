-- 1) Marca quem é administrador
alter table public.profiles
  add column is_adm boolean default false not null;