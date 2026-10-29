-- Initial schema for the showroom lead store.
-- Applies to the PostgreSQL database named in DATABASE_URL.

CREATE TABLE IF NOT EXISTS leads (
  id bigserial PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('register', 'test_drive', 'contact')),
  ref text NOT NULL UNIQUE,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_kind_idx ON leads (kind);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);