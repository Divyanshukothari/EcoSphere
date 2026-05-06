/**
 * Runs on every container boot (idempotent).
 * Creates ALL missing tables + seeds the super admin account.
 * Usage:  node seed_admin.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('./db');

async function seed() {
    console.log('── EcoSphere DB Migration ──────────────────────────');

    // ── 1. Extension ────────────────────────────────────────────
    console.log('1/7  Ensuring uuid-ossp extension...');
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ── 2. Fix role constraint ──────────────────────────────────
    console.log('2/7  Updating role constraint...');
    await pool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`);
    await pool.query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'teacher', 'super_admin'))`);

    // ── 3. Chat tables ──────────────────────────────────────────
    console.log('3/7  Ensuring chat_sessions table...');
    await pool.query(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL DEFAULT 'New Chat',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('4/7  Ensuring chat_messages table...');
    await pool.query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
            role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS chat_usage (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
            message_count INT DEFAULT 0,
            UNIQUE(user_id, usage_date)
        )
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_user    ON chat_messages(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_sessions_user    ON chat_sessions(user_id, updated_at DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_usage_user_date  ON chat_usage(user_id, usage_date)`);

    // ── 5. Challenges table ─────────────────────────────────────
    console.log('5/7  Ensuring challenges table...');
    await pool.query(`
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
        )
    `);

    // ── 6. Challenge submissions table ──────────────────────────
    console.log('6/7  Ensuring challenge_submissions table...');
    await pool.query(`
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
        )
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_submissions_status    ON challenge_submissions(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON challenge_submissions(challenge_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_submissions_user      ON challenge_submissions(user_id)`);

    // ── 7. Super admin user ─────────────────────────────────────
    console.log('7/7  Ensuring super admin user...');
    const name     = 'Super Admin';
    const email    = 'admin@ecosphere.com';
    const password = 'Admin@123';
    const hash     = await bcrypt.hash(password, 10);

    await pool.query(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, 'super_admin')
        ON CONFLICT (email)
        DO UPDATE SET password_hash = EXCLUDED.password_hash,
                      role          = 'super_admin'
    `, [name, email, hash]);

    console.log('');
    console.log('✅  Migration complete!');
    console.log(`    Admin: ${email} / ${password}`);
    process.exit(0);
}

seed().catch(err => {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
});
