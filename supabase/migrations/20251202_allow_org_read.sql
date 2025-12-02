-- Enable read access for authenticated users to search organizations
create policy "Authenticated users can view organizations" on public.organizations
  for select using (auth.role() = 'authenticated');
