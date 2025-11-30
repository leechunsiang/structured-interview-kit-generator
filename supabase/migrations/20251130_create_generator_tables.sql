-- Create jobs table
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  title text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create competencies table
create table public.competencies (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  name text not null,
  description text,
  weight integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create questions table
create type public.question_category as enum ('Competency', 'Behavioral', 'Situational');

create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  competency_id uuid references public.competencies(id) on delete cascade not null,
  text text not null,
  category public.question_category not null,
  explanation text,
  rubric_good text,
  rubric_bad text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.jobs enable row level security;
alter table public.competencies enable row level security;
alter table public.questions enable row level security;

-- RLS Policies

-- Jobs: Users can view/create jobs for their organization
create policy "Users can view org jobs" on public.jobs
  for select using (
    org_id in (
      select organization_id from public.profiles
      where id = auth.uid()
    )
  );

create policy "Users can create org jobs" on public.jobs
  for insert with check (
    org_id in (
      select organization_id from public.profiles
      where id = auth.uid()
    )
  );
  
create policy "Users can delete org jobs" on public.jobs
  for delete using (
    org_id in (
      select organization_id from public.profiles
      where id = auth.uid()
    )
  );

-- Competencies: Users can view/create/delete competencies for their org's jobs
create policy "Users can view job competencies" on public.competencies
  for select using (
    job_id in (
      select id from public.jobs
      where org_id in (
        select organization_id from public.profiles
        where id = auth.uid()
      )
    )
  );

create policy "Users can create job competencies" on public.competencies
  for insert with check (
    job_id in (
      select id from public.jobs
      where org_id in (
        select organization_id from public.profiles
        where id = auth.uid()
      )
    )
  );

create policy "Users can delete job competencies" on public.competencies
  for delete using (
    job_id in (
      select id from public.jobs
      where org_id in (
        select organization_id from public.profiles
        where id = auth.uid()
      )
    )
  );

-- Questions: Users can view/create/delete questions for their org's jobs
create policy "Users can view competency questions" on public.questions
  for select using (
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

create policy "Users can create competency questions" on public.questions
  for insert with check (
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

create policy "Users can delete competency questions" on public.questions
  for delete using (
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
