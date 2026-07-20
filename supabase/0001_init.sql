-- Business branding and customer preferences
create table if not exists business_profiles (
  id text primary key,
  name text not null,
  tagline text,
  logo_path text,
  accent_color text not null default '#b58b35',
  active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint business_profiles_id_check check (id in ('enterprise', 'barbershop', 'fashion', 'loans', 'mobile-money', 'tech'))
);

create table if not exists customer_preferences (
  customer_id uuid primary key references customers(id) on delete cascade,
  email_notifications boolean not null default true,
  booking_notifications boolean not null default true,
  promotion_notifications boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table business_profiles enable row level security;
alter table customer_preferences enable row level security;

create policy "business_profiles_select_authenticated" on business_profiles
  for select using (auth.role() = 'authenticated');
create policy "business_profiles_admin_write" on business_profiles
  for all using (is_admin()) with check (is_admin());
create policy "customer_preferences_select_own_or_admin" on customer_preferences
  for select using (auth.uid() = customer_id or is_admin());
create policy "customer_preferences_insert_own_or_admin" on customer_preferences
  for insert with check (auth.uid() = customer_id or is_admin());
create policy "customer_preferences_update_own_or_admin" on customer_preferences
  for update using (auth.uid() = customer_id or is_admin());

insert into business_profiles (id, name, tagline, logo_path, accent_color, sort_order) values
  ('enterprise', 'Alessandro Enterprises', 'One group. Many possibilities.', '/logos/alessandroenterprises.png', '#b58b35', 1),
  ('barbershop', 'Alessandro Classic Barbershop', 'Classic service, modern style.', '/logos/barbershop.png', '#d4a72c', 2),
  ('fashion', 'Alessandro Elite Fashion', 'Elegant fashion, tailored for you.', '/logos/fashion.png', '#bb8425', 3),
  ('loans', 'Alessandro Soft Loans', 'Flexible support when you need it.', '/logos/loans.png', '#81ad3b', 4),
  ('mobile-money', 'Alessandro Mobile Money', 'Fast, secure money services.', '/logos/mobilemoney.png', '#1b9b5b', 5),
  ('tech', 'Alessandro Tech Solutions', 'Technology built for growth.', '/logos/tchsolutions.png', '#00a8dc', 6)
on conflict (id) do update set name = excluded.name, tagline = excluded.tagline, logo_path = excluded.logo_path, accent_color = excluded.accent_color, sort_order = excluded.sort_order, updated_at = now();
