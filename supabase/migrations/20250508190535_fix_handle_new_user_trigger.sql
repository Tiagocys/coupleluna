-- 1) Exclui trigger e função antigos caso existam
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2) Cria função segura que só insere avatar se metadata existir
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    is_creator,
    created_at
  ) values (
    new.id,
    split_part(new.email, '@', 1),
    split_part(new.email, '@', 1),
    -- coalesce: tenta pegar avatar_url, senão null
    new.raw_user_meta_data->>'avatar_url',
    false,
    now()
  );
  return new;
end;
$$ language plpgsql;

-- 3) Cria trigger novamente
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
