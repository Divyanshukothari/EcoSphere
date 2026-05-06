-- ─────────────────────────────────────────────────────────────────────────────
-- Step 1: Update role constraint to allow super_admin
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('student', 'teacher', 'super_admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 2: Challenges table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenges (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        VARCHAR(255) NOT NULL,
    description  TEXT NOT NULL,
    category     VARCHAR(100) NOT NULL DEFAULT 'General',
    difficulty   VARCHAR(20)  NOT NULL DEFAULT 'medium'
                     CHECK (difficulty IN ('easy', 'medium', 'hard')),
    points       INT  NOT NULL DEFAULT 50,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    deadline     TIMESTAMP,
    created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 3: Student submissions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenge_submissions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    description  TEXT NOT NULL,
    proof_url    TEXT,
    status       VARCHAR(20) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note   TEXT,
    reviewed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at  TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_status      ON challenge_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge   ON challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user        ON challenge_submissions(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 4: Seed super admin  (run seed_admin.js instead for a proper bcrypt hash)
--         This is a placeholder — run: node seed_admin.js
-- ─────────────────────────────────────────────────────────────────────────────
-- (actual user creation is handled by seed_admin.js)
