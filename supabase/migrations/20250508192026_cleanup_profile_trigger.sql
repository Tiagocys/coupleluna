-- drop do trigger e da função antigos
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- remove default de avatar_url para voltar ao estado original
alter table public.profiles
  alter column avatar_url drop default;

