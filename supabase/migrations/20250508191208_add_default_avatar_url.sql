-- 1) Define valor default na coluna avatar_url
alter table public.profiles
alter column avatar_url
set default 'https://example.com/default-avatar.png';

-- 2) Atualiza todos os perfis existentes que estejam com avatar_url NULL
update public.profiles
set avatar_url = 'https://example.com/default-avatar.png'
where avatar_url is null;
