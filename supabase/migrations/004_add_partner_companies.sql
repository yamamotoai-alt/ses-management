create table if not exists partner_companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_person text,
  email text,
  phone text,
  contact_method text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger partner_companies_updated_at
  before update on partner_companies
  for each row execute function update_updated_at();

alter table partner_companies enable row level security;

create policy "partner_companies_auth" on partner_companies
  for all to authenticated using (true) with check (true);
