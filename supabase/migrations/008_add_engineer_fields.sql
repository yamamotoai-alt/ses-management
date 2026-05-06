alter table engineers
  add column if not exists nationality text,
  add column if not exists desired_project text,
  add column if not exists inflow_source text check (inflow_source in ('クラウドワークス', '複業クラウド', 'indeed', 'その他')),
  add column if not exists working_hours text,
  add column if not exists personality text,
  add column if not exists notes text;
