-- perfis
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  is_creator boolean default false,
  created_at timestamptz default now()
);

-- planos de assinatura
create table public.plans (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references profiles(id) on delete cascade,
  name text not null,
  price_cents int not null,
  currency text default 'USD',
  interval text default 'month'
);

-- assinaturas
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  plan_id uuid references plans(id) on delete cascade,
  status text default 'inactive',
  current_period_end timestamptz
);
