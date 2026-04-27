-- エンジニアテーブル
create table if not exists engineers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age integer,
  nearest_station text,
  monthly_rate integer,
  languages jsonb default '[]'::jsonb,
  frameworks jsonb default '[]'::jsonb,
  cloud_environments jsonb default '[]'::jsonb,
  work_style text check (work_style in ('フルリモート', 'ハイブリッド', '常駐')),
  available_from text,
  skill_summary text,
  status text not null default '待機中' check (status in ('稼働中', '待機中')),
  top_sales_target text,
  interview_person text,
  sales_person text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 案件テーブル
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  introducer text,
  budget_min integer,
  budget_max integer,
  duration text,
  required_languages jsonb default '[]'::jsonb,
  required_frameworks jsonb default '[]'::jsonb,
  required_cloud jsonb default '[]'::jsonb,
  work_style text check (work_style in ('フルリモート', 'ハイブリッド', '常駐')),
  required_experience_years integer,
  description text,
  status text not null default '募集中' check (status in ('募集中', '終了')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- マッチング結果キャッシュ（任意）
create table if not exists matching_results (
  id uuid primary key default gen_random_uuid(),
  engineer_id uuid references engineers(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  score integer check (score between 0 and 100),
  reason text,
  created_at timestamptz default now()
);

-- updated_at 自動更新トリガー
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger engineers_updated_at
  before update on engineers
  for each row execute function update_updated_at();

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

-- RLS（Row Level Security）
alter table engineers enable row level security;
alter table projects enable row level security;
alter table matching_results enable row level security;

-- 認証済みユーザーのみアクセス可能
create policy "engineers_auth" on engineers for all to authenticated using (true) with check (true);
create policy "projects_auth" on projects for all to authenticated using (true) with check (true);
create policy "matching_auth" on matching_results for all to authenticated using (true) with check (true);

-- インデックス
create index if not exists engineers_status_idx on engineers(status);
create index if not exists projects_status_idx on projects(status);
create index if not exists matching_engineer_idx on matching_results(engineer_id);
create index if not exists matching_project_idx on matching_results(project_id);
