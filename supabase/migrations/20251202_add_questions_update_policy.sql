-- Add UPDATE policy for questions table
-- This allows users to update questions for jobs in their organization

create policy "Users can update competency questions" on public.questions
  for update using (
    competency_id in (
      select id from public.competencies
      where job_id in (
        select id from public.jobs
        where org_id in (
          select organization_id from public.profiles
          where id = auth.uid()
        )
      )
    )
  );
