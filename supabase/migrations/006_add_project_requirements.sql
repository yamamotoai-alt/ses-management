alter table projects
  add column if not exists required_requirements text,
  add column if not exists preferred_requirements text;
