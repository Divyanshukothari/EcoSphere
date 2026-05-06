require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const pool    = require('./db');

const authRoutes        = require('./routes/auth');
const coursesRoutes     = require('./routes/courses');
const progressRoutes    = require('./routes/progress');
const badgesRoutes      = require('./routes/badges');
const chatRoutes        = require('./routes/chat');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes       = require('./routes/admin');
const challengesRoutes  = require('./routes/challenges');

// ── Inline migration + seed (runs on every cold start) ───────────────────────
async function runSeed() {
    try {
        console.log('── EcoSphere DB Migration ──────────────────────────');

        await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Core tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'student',
                is_approved BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Fix role constraint to include super_admin
        await pool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`);
        await pool.query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'teacher', 'super_admin'))`);

        // is_approved column (safe on existing tables)
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT TRUE`);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                created_by UUID REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS lessons (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                order_index INT NOT NULL
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS quizzes (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
                question_text TEXT NOT NULL
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS options (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
                option_text TEXT NOT NULL,
                is_correct BOOLEAN DEFAULT FALSE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS progress (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
                completed_lessons INT DEFAULT 0,
                quiz_score INT DEFAULT 0,
                UNIQUE(user_id, course_id)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS badges (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                condition_type VARCHAR(50) NOT NULL CHECK (condition_type IN ('LESSONS', 'QUIZ')),
                condition_value INT NOT NULL
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_badges (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
                awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, badge_id)
            )
        `);

        // Chat tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                title TEXT NOT NULL DEFAULT 'New Chat',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

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

        // Challenge tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS challenges (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                category VARCHAR(100) NOT NULL DEFAULT 'General',
                difficulty VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
                points INT NOT NULL DEFAULT 50,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                deadline TIMESTAMP,
                created_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS challenge_submissions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                description TEXT NOT NULL,
                proof_url TEXT,
                status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
                admin_note TEXT,
                reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
                reviewed_at TIMESTAMP,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (challenge_id, user_id)
            )
        `);

        // Indexes
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_lessons_course         ON lessons(course_id, order_index)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_session  ON chat_messages(session_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_user     ON chat_messages(user_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_sessions_user     ON chat_sessions(user_id, updated_at DESC)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_usage_user_date   ON chat_usage(user_id, usage_date)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_submissions_status     ON challenge_submissions(status)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_submissions_challenge  ON challenge_submissions(challenge_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_submissions_user       ON challenge_submissions(user_id)`);

        // Super admin user
        const hash = await bcrypt.hash('Admin@123', 10);
        await pool.query(`
            INSERT INTO users (name, email, password_hash, role, is_approved)
            VALUES ('Super Admin', 'admin@ecosphere.com', $1, 'super_admin', TRUE)
            ON CONFLICT (email)
            DO UPDATE SET role = 'super_admin', is_approved = TRUE
        `, [hash]);

        console.log('✅  Migration complete! Admin: admin@ecosphere.com / Admin@123');
    } catch (err) {
        console.error('❌  Migration error:', err.message);
        // Don't crash the server — DB may already be set up
    }
}

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();

const ALLOWED_ORIGINS = [
    'https://eco-sphere-nine-xi.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());
app.use(express.json());

app.use('/api/auth',        authRoutes);
app.use('/api/courses',     coursesRoutes);
app.use('/api/progress',    progressRoutes);
app.use('/api/badges',      badgesRoutes);
app.use('/api/chat',        chatRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/challenges',  challengesRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Boot: run migration then start server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

runSeed().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

module.exports = app; // required for Vercel serverless
