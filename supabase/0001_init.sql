-- =========================================================
-- Alessandro Enterprises — Initial schema, RLS, and Realtime
-- =========================================================
-- Run this in the Supabase SQL editor, or via:
--   supabase db push
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- Tables
-- ---------------------------------------------------------

create table if not exists customers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  business text,
  email text not null,
  phone text,
  address text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  duration integer, -- minutes
  price numeric(10, 2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  service_id uuid not null references services(id) on delete restrict,
  date timestamptz not null,
  notes text,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  subject text not null,
  body text not null,
  status text not null default 'Sent',
  sent_at timestamptz not null default now()
);

create table if not exists requests (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  request_type text not null,
  description text not null,
  status text not null default 'Open',
  created_at timestamptz not null default now()
);

create table if not exists emails (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  subject text not null,
  body text not null,
  status text not null default 'Sent',
  sent_at timestamptz not null default now()
);

create table if not exists promotions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  discount numeric(5, 2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Helper: is the current user an admin?
-- Admins are identified via a claim on their JWT app_metadata:
--   { "role": "admin" }
-- Set this on a user with:
--   update auth.users set raw_app_meta_data =
--     raw_app_meta_data || '{"role":"admin"}'::jsonb
--   where email = 'admin@example.com';
-- ---------------------------------------------------------

create or replace function is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ---------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------

alter table customers enable row level security;
alter table services enable row level security;
alter table bookings enable row level security;
alter table messages enable row level security;
alter table requests enable row level security;
alter table emails enable row level security;
alter table promotions enable row level security;

-- customers: read/update own profile; admin full access
create policy "customers_select_own_or_admin" on customers
  for select using (auth.uid() = id or is_admin());

create policy "customers_update_own_or_admin" on customers
  for update using (auth.uid() = id or is_admin());

create policy "customers_insert_own_or_admin" on customers
  for insert with check (auth.uid() = id or is_admin());

create policy "customers_delete_admin_only" on customers
  for delete using (is_admin());

-- services: readable by any authenticated user; writable by admin only
create policy "services_select_authenticated" on services
  for select using (auth.role() = 'authenticated');

create policy "services_write_admin_only" on services
  for all using (is_admin()) with check (is_admin());

-- bookings: customer can insert/read own; admin full access
create policy "bookings_select_own_or_admin" on bookings
  for select using (auth.uid() = customer_id or is_admin());

create policy "bookings_insert_own_or_admin" on bookings
  for insert with check (auth.uid() = customer_id or is_admin());

create policy "bookings_update_admin_only" on bookings
  for update using (is_admin());

create policy "bookings_delete_admin_only" on bookings
  for delete using (is_admin());

-- messages: customer can insert/read own; admin full access
create policy "messages_select_own_or_admin" on messages
  for select using (auth.uid() = customer_id or is_admin());

create policy "messages_insert_own_or_admin" on messages
  for insert with check (auth.uid() = customer_id or is_admin());

create policy "messages_update_admin_only" on messages
  for update using (is_admin());

create policy "messages_delete_admin_only" on messages
  for delete using (is_admin());

-- requests: customer can insert/read own; admin full access
create policy "requests_select_own_or_admin" on requests
  for select using (auth.uid() = customer_id or is_admin());

create policy "requests_insert_own_or_admin" on requests
  for insert with check (auth.uid() = customer_id or is_admin());

create policy "requests_update_admin_only" on requests
  for update using (is_admin());

create policy "requests_delete_admin_only" on requests
  for delete using (is_admin());

-- emails: customer can insert/read own; admin full access
create policy "emails_select_own_or_admin" on emails
  for select using (auth.uid() = customer_id or is_admin());

create policy "emails_insert_own_or_admin" on emails
  for insert with check (auth.uid() = customer_id or is_admin());

create policy "emails_update_admin_only" on emails
  for update using (is_admin());

create policy "emails_delete_admin_only" on emails
  for delete using (is_admin());

-- promotions: readable by any authenticated user; writable by admin only
create policy "promotions_select_authenticated" on promotions
  for select using (auth.role() = 'authenticated');

create policy "promotions_write_admin_only" on promotions
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------
-- Realtime: add tables to the supabase_realtime publication
-- ---------------------------------------------------------

alter publication supabase_realtime add table customers;
alter publication supabase_realtime add table services;
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table requests;
alter publication supabase_realtime add table emails;
alter publication supabase_realtime add table promotions;

-- ---------------------------------------------------------
-- Auto-create a customers row when a new auth user signs up
-- ---------------------------------------------------------

create or replace function handle_new_customer()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.customers (id, name, business, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.raw_user_meta_data ->> 'business',
    new.email,
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_customer();
