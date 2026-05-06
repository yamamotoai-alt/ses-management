alter table engineers
  add column if not exists interviewed boolean not null default false;
