-- Add unique constraint on (source, source_id) to enable upsert from Grants.gov API
-- source_id must be non-null for the constraint to apply (nulls are excluded from unique checks in PostgreSQL)
alter table grants
  add constraint grants_source_source_id_unique unique (source, source_id);
