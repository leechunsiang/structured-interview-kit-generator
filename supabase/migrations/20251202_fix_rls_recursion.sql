-- Fix infinite recursion in RLS policies by using security definer functions

-- Function to get current user's organization ID (bypassing RLS)
create or replace function get_auth_user_org_id()
returns uuid
language plpgsql
security definer
stable
as $$
declare
  org_id uuid;
begin
  select organization_id into org_id
  from public.profiles
  where id = auth.uid();
  return org_id;
end;
$$;

-- Function to get current user's role (bypassing RLS)
create or replace function get_auth_user_role()
returns public.app_role
language plpgsql
security definer
stable
as $$
declare
  user_role public.app_role;
begin
  select role into user_role
  from public.profiles
  where id = auth.uid();
  return user_role;
end;
$$;

-- Fix "Members can view org members" policy
drop policy if exists "Members can view org members" on public.profiles;
create policy "Members can view org members" on public.profiles
  for select using (
    organization_id = get_auth_user_org_id()
  );

-- Fix "Admins can update org members" policy
drop policy if exists "Admins can update org members" on public.profiles;
create policy "Admins can update org members" on public.profiles
  for update using (
    get_auth_user_role() = 'admin' 
    and organization_id = get_auth_user_org_id()
  );
