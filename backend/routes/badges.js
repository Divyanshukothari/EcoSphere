const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.post('/', authenticateToken, requireRole('teacher'), async (req, res) => {
    try {
        const { course_id, title, description, condition_type, condition_value } = req.body;
        const result = await pool.query(
            'INSERT INTO badges (course_id, title, description, condition_type, condition_value) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [course_id, title, description, condition_type, condition_value]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/user', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, ub.awarded_at 
            FROM user_badges ub 
            JOIN badges b ON ub.badge_id = b.id 
            WHERE ub.user_id = $1
            ORDER BY ub.awarded_at DESC
        `, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/course/:course_id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM badges WHERE course_id = $1', [req.params.course_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
