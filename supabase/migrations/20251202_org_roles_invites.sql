-- Create enum for application roles
create type public.app_role as enum ('admin', 'member');

-- Add role column to profiles
alter table public.profiles 
add column role public.app_role not null default 'member';

-- Create organization_invites table
create table public.organization_invites (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role public.app_role not null default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, email)
);

-- Enable RLS on invites
alter table public.organization_invites enable row level security;

-- Update create_organization function to make creator an admin
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

  -- Update user profile with organization_id and set role to admin
  update public.profiles
  set 
    organization_id = new_org_id,
    role = 'admin'
  where id = auth.uid();

  return new_org_id;
end;
$$;

-- RLS Policies for Profiles (Update)
-- Allow admins to update profiles in their org (to change roles or remove users)
create policy "Admins can update org members" on public.profiles
  for update using (
    auth.uid() in (
      select id from public.profiles 
      where organization_id = profiles.organization_id 
      and role = 'admin'
    )
  );

-- RLS Policies for Invites

-- Admins can view invites for their org
create policy "Admins can view org invites" on public.organization_invites
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and organization_id = organization_invites.organization_id
      and role = 'admin'
    )
  );

-- Admins can create invites for their org
create policy "Admins can create org invites" on public.organization_invites
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and organization_id = organization_invites.organization_id
      and role = 'admin'
    )
  );

-- Admins can delete invites for their org
create policy "Admins can delete org invites" on public.organization_invites
  for delete using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and organization_id = organization_invites.organization_id
      and role = 'admin'
    )
  );

-- Users can view invites sent to their email
create policy "Users can view own invites" on public.organization_invites
  for select using (
    email = (select email from public.profiles where id = auth.uid())
  );
