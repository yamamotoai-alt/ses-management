alter table projects
  add column if not exists engineer_price_min integer,
  add column if not exists engineer_price_max integer;
