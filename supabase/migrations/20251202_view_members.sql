-- Ensure RLS is enabled
alter table public.profiles enable row level security;

-- Policy: Users can view their own profile
-- (Using 'create policy if not exists' logic by dropping first to avoid errors if re-running, 
--  but standard SQL doesn't have 'create or replace policy'. 
--  Supabase/Postgres requires dropping if it exists, or just creating with a unique name.)

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (
    id = auth.uid()
  );

-- Policy: Members can view other members of the same organization
drop policy if exists "Members can view org members" on public.profiles;
create policy "Members can view org members" on public.profiles
  for select using (
    organization_id in (
      select organization_id from public.profiles 
      where id = auth.uid()
    )
  );
