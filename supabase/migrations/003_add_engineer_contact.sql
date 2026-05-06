alter table engineers
  add column if not exists email text,
  add column if not exists phone text;
