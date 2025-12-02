-- Add invite code columns to organizations
alter table public.organizations 
add column invite_code text unique,
add column invite_code_enabled boolean default true;

-- Drop old invites table
drop table if exists public.organization_invites;

-- Function to generate random code
create or replace function generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text[] := '{A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,2,3,4,5,6,7,8,9}';
  result text := '';
  i integer := 0;
begin
  for i in 1..6 loop
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  end loop;
  return result;
end;
$$;

-- Update create_organization to generate code
create or replace function create_organization(org_name text)
returns uuid
language plpgsql
security definer
as $$
declare
  new_org_id uuid;
  new_code text;
begin
  -- Generate unique code
  loop
    new_code := generate_invite_code();
    exit when not exists (select 1 from public.organizations where invite_code = new_code);
  end loop;

  -- Create organization
  insert into public.organizations (name, invite_code)
  values (org_name, new_code)
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

-- RPC to join organization by code
create or replace function join_organization_by_code(code text)
returns uuid
language plpgsql
security definer
as $$
declare
  target_org_id uuid;
begin
  -- Find org with code
  select id into target_org_id
  from public.organizations
  where invite_code = code
  and invite_code_enabled = true;

  if target_org_id is null then
    raise exception 'Invalid or disabled invite code';
  end if;

  -- Update user profile
  update public.profiles
  set 
    organization_id = target_org_id,
    role = 'member'
  where id = auth.uid();

  return target_org_id;
end;
$$;

-- RPC to regenerate code (Admin only)
create or replace function regenerate_invite_code(org_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  new_code text;
begin
  -- Check if user is admin of this org
  if not exists (
    select 1 from public.profiles
    where id = auth.uid()
    and organization_id = org_id
    and role = 'admin'
  ) then
    raise exception 'Only admins can regenerate invite codes';
  end if;

  -- Generate unique code
  loop
    new_code := generate_invite_code();
    exit when not exists (select 1 from public.organizations where invite_code = new_code);
  end loop;

  -- Update org
  update public.organizations
  set invite_code = new_code
  where id = org_id;

  return new_code;
end;
$$;

-- Allow admins to view their org's invite code
-- (Already covered by "Authenticated users can view organizations" policy? 
--  Wait, that policy was for ALL authenticated users. 
--  We might want to restrict viewing the code to ONLY members of that org.)

-- Update organization view policy to only allow members to see the code?
-- Actually, for simplicity, let's assume if you can see the org, you can see the code? 
-- No, that defeats the purpose if we have a search.
-- But we removed search.
-- So only members can see their own org.

-- Let's update the policy to be stricter if we want, but for now, let's ensure
-- users can only select *their own* organization details usually.
-- But wait, we had a policy "Authenticated users can view organizations" for search.
-- We should probably REVOKE that or modify it since we don't need search anymore.

drop policy "Authenticated users can view organizations" on public.organizations;

create policy "Users can view own organization" on public.organizations
  for select using (
    id in (
      select organization_id from public.profiles
      where id = auth.uid()
    )
  );
