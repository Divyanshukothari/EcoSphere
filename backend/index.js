require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes        = require('./routes/auth');
const coursesRoutes     = require('./routes/courses');
const progressRoutes    = require('./routes/progress');
const badgesRoutes      = require('./routes/badges');
const chatRoutes        = require('./routes/chat');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes       = require('./routes/admin');
const challengesRoutes  = require('./routes/challenges');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
    'https://eco-sphere-nine-xi.vercel.app', // production frontend
    'http://localhost:5173',                 // Vite local dev
    'http://localhost:3000',                 // fallback local dev
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow no-origin requests (Postman, mobile, server-to-server)
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

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/courses',     coursesRoutes);
app.use('/api/progress',    progressRoutes);
app.use('/api/badges',      badgesRoutes);
app.use('/api/chat',        chatRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/challenges',  challengesRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // required for Vercel serverless
