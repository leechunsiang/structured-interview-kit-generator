-- Create job status enum
create type public.job_status as enum ('draft', 'pending', 'approved', 'rejected');

-- Add submission tracking columns to jobs table
alter table public.jobs
add column status public.job_status not null default 'draft',
add column submitted_at timestamp with time zone,
add column reviewed_at timestamp with time zone,
add column reviewed_by uuid references public.profiles(id),
add column rejection_reason text;

-- Set existing jobs to approved status for backward compatibility
update public.jobs set status = 'approved' where status = 'draft';

-- Drop existing RLS policies on jobs to recreate them with new logic
drop policy if exists "Users can view org jobs" on public.jobs;
drop policy if exists "Users can create org jobs" on public.jobs;
drop policy if exists "Users can delete org jobs" on public.jobs;

-- RLS Policies for Jobs with admin support

-- Users can view their own jobs OR approved jobs in their org OR all jobs if they're admin
create policy "Users can view org jobs" on public.jobs
  for select using (
    org_id in (
      select organization_id from public.profiles
      where id = auth.uid()
    )
    and (
      -- User is the creator
      profile_id = auth.uid()
      -- OR job is approved
      or status = 'approved'
      -- OR user is an admin in the org
      or exists (
        select 1 from public.profiles
        where id = auth.uid()
        and organization_id = jobs.org_id
        and role = 'admin'
      )
    )
  );

-- Users can create jobs in their organization
create policy "Users can create org jobs" on public.jobs
  for insert with check (
    org_id in (
      select organization_id from public.profiles
      where id = auth.uid()
    )
  );

-- Users can update their own jobs (to submit) OR admins can update any job in their org (to approve/reject)
create policy "Users can update org jobs" on public.jobs
  for update using (
    org_id in (
      select organization_id from public.profiles
      where id = auth.uid()
    )
    and (
      -- User is the creator (can submit)
      profile_id = auth.uid()
      -- OR user is an admin (can approve/reject)
      or exists (
        select 1 from public.profiles
        where id = auth.uid()
        and organization_id = jobs.org_id
        and role = 'admin'
      )
    )
  );

-- Users can delete their own jobs OR admins can delete any job in their org
create policy "Users can delete org jobs" on public.jobs
  for delete using (
    org_id in (
      select organization_id from public.profiles
      where id = auth.uid()
    )
    and (
      profile_id = auth.uid()
      or exists (
        select 1 from public.profiles
        where id = auth.uid()
        and organization_id = jobs.org_id
        and role = 'admin'
      )
    )
  );
