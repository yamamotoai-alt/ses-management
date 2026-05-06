alter table engineers
  add column if not exists skill_sheet_real_path text,
  add column if not exists skill_sheet_initials_path text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('skill-sheets', 'skill-sheets', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "authenticated can upload skill sheets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'skill-sheets');

CREATE POLICY "authenticated can read skill sheets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'skill-sheets');

CREATE POLICY "authenticated can delete skill sheets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'skill-sheets');
