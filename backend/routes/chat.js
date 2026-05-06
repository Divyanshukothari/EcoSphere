const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const DAILY_LIMIT = parseInt(process.env.DAILY_MESSAGE_LIMIT) || 10;
const MODEL = 'gemma-4-26b-a4b-it';

const SYSTEM_PROMPT = `You are EcoBot, an expert environmental education assistant for EcoSphere — a gamified learning platform focused on ecology and environmental science.

Your role:
- Answer questions about environment, ecology, climate change, sustainability, biodiversity, renewable energy, pollution, conservation, and related topics.
- Be encouraging, friendly, and educational — tailored to students at various learning levels.
- When relevant, connect your answers to real-world examples and actionable tips.
- Keep answers concise but informative (2-4 paragraphs max unless the topic demands more).
- If a question is NOT related to environmental topics, politely redirect the student back to environmental questions.
- Use emojis sparingly to make responses feel friendly and approachable 🌿.

You must NOT:
- Answer questions completely unrelated to environment, science, or education.
- Generate code, essays, or do homework for students.
- Discuss politics or controversial non-environmental topics.`;

// ── Helpers ──────────────────────────────────────────────────────────────────

const getUsageToday = async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const res = await pool.query(
        'SELECT message_count FROM chat_usage WHERE user_id = $1 AND usage_date = $2',
        [userId, today]
    );
    return res.rows[0]?.message_count || 0;
};

const incrementUsage = async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    await pool.query(`
        INSERT INTO chat_usage (user_id, usage_date, message_count)
        VALUES ($1, $2, 1)
        ON CONFLICT (user_id, usage_date)
        DO UPDATE SET message_count = chat_usage.message_count + 1
    `, [userId, today]);
};

// Generate a short title from the first user message
const generateTitle = (message) => {
    const words = message.trim().split(/\s+/).slice(0, 6).join(' ');
    return words.length < message.trim().length ? words + '…' : words;
};

// ── Session Routes ────────────────────────────────────────────────────────────

// GET /api/chat/sessions — list all sessions for this user
router.get('/sessions', authenticateToken, requireRole('student'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, created_at, updated_at,
                (SELECT COUNT(*) FROM chat_messages WHERE session_id = chat_sessions.id) as message_count
             FROM chat_sessions
             WHERE user_id = $1
             ORDER BY updated_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/chat/sessions — create a new session
router.post('/sessions', authenticateToken, requireRole('student'), async (req, res) => {
    try {
        const { title } = req.body;
        const result = await pool.query(
            'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING *',
            [req.user.id, title || 'New Chat']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/chat/sessions/:sessionId — rename session
router.patch('/sessions/:sessionId', authenticateToken, requireRole('student'), async (req, res) => {
    try {
        const { title } = req.body;
        const result = await pool.query(
            'UPDATE chat_sessions SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [title, req.params.sessionId, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/chat/sessions/:sessionId — delete session + messages
router.delete('/sessions/:sessionId', authenticateToken, requireRole('student'), async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2',
            [req.params.sessionId, req.user.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/chat/sessions/:sessionId/messages — get all messages in a session
router.get('/sessions/:sessionId/messages', authenticateToken, requireRole('student'), async (req, res) => {
    try {
        const sessionCheck = await pool.query(
            'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
            [req.params.sessionId, req.user.id]
        );
        if (sessionCheck.rows.length === 0) return res.status(404).json({ error: 'Session not found' });

        const result = await pool.query(
            'SELECT id, role, content, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
            [req.params.sessionId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/chat/sessions/:sessionId/message — send a message in a session
router.post('/sessions/:sessionId/message', authenticateToken, requireRole('student'), async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;
        const { sessionId } = req.params;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        // Verify session belongs to this user
        const sessionCheck = await pool.query(
            'SELECT id, title FROM chat_sessions WHERE id = $1 AND user_id = $2',
            [sessionId, userId]
        );
        if (sessionCheck.rows.length === 0) return res.status(404).json({ error: 'Session not found' });

        // Check daily limit
        const usedToday = await getUsageToday(userId);
        if (usedToday >= DAILY_LIMIT) {
            return res.status(429).json({
                error: 'Daily limit reached',
                message: `You've used all ${DAILY_LIMIT} free messages for today. Your limit resets at midnight. 🌙`,
                used: usedToday,
                limit: DAILY_LIMIT
            });
        }

        // Fetch this session's message history for context
        const historyRes = await pool.query(
            'SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT 20',
            [sessionId]
        );
        const recentHistory = historyRes.rows.reverse();

        // Build SDK history — must start with 'user', alternate user/model
        const sdkHistory = recentHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
        while (sdkHistory.length > 0 && sdkHistory[0].role === 'model') sdkHistory.shift();

        // Create chat session with Gemma 4 via new SDK
        const chat = ai.chats.create({
            model: MODEL,
            config: { systemInstruction: SYSTEM_PROMPT },
            history: sdkHistory,
        });

        const result = await chat.sendMessage({ message: message.trim() });
        const reply = result.text;

        // Auto-title session from first message if still "New Chat"
        const isFirstMessage = recentHistory.length === 0;
        if (isFirstMessage && sessionCheck.rows[0].title === 'New Chat') {
            const autoTitle = generateTitle(message);
            await pool.query(
                'UPDATE chat_sessions SET title = $1, updated_at = NOW() WHERE id = $2',
                [autoTitle, sessionId]
            );
        } else {
            await pool.query('UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1', [sessionId]);
        }

        // Persist both messages
        await pool.query(
            'INSERT INTO chat_messages (user_id, session_id, role, content) VALUES ($1, $2, $3, $4)',
            [userId, sessionId, 'user', message.trim()]
        );
        await pool.query(
            'INSERT INTO chat_messages (user_id, session_id, role, content) VALUES ($1, $2, $3, $4)',
            [userId, sessionId, 'assistant', reply]
        );

        await incrementUsage(userId);

        const newUsed = usedToday + 1;
        const updatedSession = await pool.query(
            'SELECT id, title FROM chat_sessions WHERE id = $1', [sessionId]
        );
        res.json({
            reply,
            session: updatedSession.rows[0],
            usage: { used: newUsed, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - newUsed) }
        });

    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ error: 'Failed to get a response. Please try again.' });
    }
});

// ── Usage Route ───────────────────────────────────────────────────────────────

router.get('/usage', authenticateToken, requireRole('student'), async (req, res) => {
    try {
        const used = await getUsageToday(req.user.id);
        res.json({ used, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used) });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
