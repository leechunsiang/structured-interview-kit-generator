-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create organizations table
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table (syncs with auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;

-- RLS Policies

-- Profiles: Users can view and update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Organizations: Users can view their own organization
create policy "Users can view their organization" on public.organizations
  for select using (
    id in (
      select organization_id from public.profiles
      where id = auth.uid()
    )
  );

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC Function to create organization and link to user
create or replace function create_organization(org_name text)
returns uuid
language plpgsql
security definer
as $$
declare
  new_org_id uuid;
begin
  -- Create organization
  insert into public.organizations (name)
  values (org_name)
  returning id into new_org_id;

  -- Update user profile with organization_id
  update public.profiles
  set organization_id = new_org_id
  where id = auth.uid();

  return new_org_id;
end;
$$;
