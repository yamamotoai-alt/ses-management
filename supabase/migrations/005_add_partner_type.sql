alter table partner_companies
  add column if not exists partner_type text check (partner_type in ('人員出し', '案件出し', '両方'));
