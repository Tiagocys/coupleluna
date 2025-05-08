-- add_user_profile_trigger.sql

-- 1) Função que cria um profile automaticamente
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
    new.raw_user_meta_data->>'avatar_url',
    false,
    now()
  );
  return new;
end;
$$ language plpgsql;

-- 2) Trigger que dispara após novo auth.user
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
