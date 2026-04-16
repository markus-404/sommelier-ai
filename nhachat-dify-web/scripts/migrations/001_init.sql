-- Nhà Chát Sommelier — question log schema
-- Run once against Neon via `npm run db:init` (scripts/db-init.mjs)
-- or paste into the Neon SQL console.

CREATE TABLE IF NOT EXISTS questions (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id  TEXT,
  msg_num     INT,
  question    TEXT NOT NULL,
  source      TEXT,
  has_profile BOOLEAN DEFAULT FALSE,
  occasion    TEXT,
  intensity   TEXT,
  sweetness   TEXT,
  user_agent  TEXT,
  referrer    TEXT
);

CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_session    ON questions (session_id);
