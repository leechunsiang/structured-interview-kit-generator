-- Add profile_id to jobs table
alter table public.jobs 
add column profile_id uuid references public.profiles(id);

-- Create index for performance
create index jobs_profile_id_idx on public.jobs(profile_id);

-- Update RLS policies to allow users to see their own jobs on the dashboard
-- The existing policy "Users can view org jobs" allows viewing all jobs in the org.
-- We will keep that for the "All Jobs" page, but the Dashboard will filter by profile_id in the query.
-- However, we should ensure that if we wanted strict RLS for the dashboard, we could add it.
-- For now, the requirement is "in the dashboard, only the jobs created by the user can be seen".
-- This can be achieved by filtering in the frontend query, as long as the user *can* see all jobs (for the All Jobs page).
-- So we don't strictly need to change RLS for SELECT if "All Jobs" page is available to everyone in the org.

-- But let's check if we need to update the INSERT policy.
-- "Users can create org jobs" checks org_id. We should probably ensure profile_id matches auth.uid() if provided.
-- But the current policy is:
-- create policy "Users can create org jobs" on public.jobs
--   for insert with check (
--     org_id in (
--       select organization_id from public.profiles
--       where id = auth.uid()
--     )
--   );
-- This is fine.

-- We might want to set a default for profile_id to auth.uid() but the frontend can send it.
