-- FRAMEMINT · Supabase schema
-- Paste this whole file into Supabase Dashboard -> SQL Editor -> Run.

-- ===== profiles: one row per user, holds the credit balance =====
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  credits integer not null default 100,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

-- ===== signup bonus: auto-create profile with 100 credits =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===== render jobs: ledger entry per render, enables refund-once =====
create table if not exists public.render_jobs (
  id text primary key,                -- upstream task id
  user_id uuid not null references auth.users(id) on delete cascade,
  engine text not null,
  prompt text,
  cost integer not null,
  status text not null default 'running',  -- running | done | refunded
  video_url text,
  created_at timestamptz default now()
);
alter table public.render_jobs enable row level security;
drop policy if exists "read own jobs" on public.render_jobs;
create policy "read own jobs" on public.render_jobs
  for select using (auth.uid() = user_id);

-- ===== credit orders: top-up history =====
create table if not exists public.credit_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pack text not null,
  credits integer not null,
  status text not null default 'paid_simulated',  -- swap to real PSP later
  created_at timestamptz default now()
);
alter table public.credit_orders enable row level security;
drop policy if exists "read own orders" on public.credit_orders;
create policy "read own orders" on public.credit_orders
  for select using (auth.uid() = user_id);

-- ===== service-role-only balance helpers (atomic) =====
create or replace function public.spend_credits(p_user uuid, p_cost int)
returns int language plpgsql security definer set search_path = public as $$
declare new_balance int;
begin
  update profiles set credits = credits - p_cost
   where id = p_user and credits >= p_cost
   returning credits into new_balance;
  return coalesce(new_balance, -1);   -- -1 means insufficient balance
end; $$;
revoke execute on function public.spend_credits(uuid, int) from public, anon, authenticated;

create or replace function public.add_credits(p_user uuid, p_amount int)
returns int language plpgsql security definer set search_path = public as $$
declare new_balance int;
begin
  update profiles set credits = credits + p_amount
   where id = p_user
   returning credits into new_balance;
  return coalesce(new_balance, -1);
end; $$;
revoke execute on function public.add_credits(uuid, int) from public, anon, authenticated;
