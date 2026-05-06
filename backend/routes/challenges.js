const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { authenticateToken } = require('../middleware/auth');

/* ─────────────────────────────────────────────────────────────────
   GET /api/challenges
   List all ACTIVE challenges with the current student's submission status
───────────────────────────────────────────────────────────────── */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                c.*,
                cs.id          AS submission_id,
                cs.status      AS submission_status,
                cs.admin_note  AS submission_note,
                cs.submitted_at
            FROM challenges c
            LEFT JOIN challenge_submissions cs
                   ON cs.challenge_id = c.id
                  AND cs.user_id      = $1
            WHERE c.is_active = TRUE
            ORDER BY c.created_at DESC
        `, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/* ─────────────────────────────────────────────────────────────────
   GET /api/challenges/my-submissions
   All submissions by the requesting student
───────────────────────────────────────────────────────────────── */
router.get('/my-submissions', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                cs.*,
                c.title       AS challenge_title,
                c.points      AS challenge_points,
                c.difficulty  AS challenge_difficulty,
                c.category    AS challenge_category
            FROM challenge_submissions cs
            JOIN challenges c ON cs.challenge_id = c.id
            WHERE cs.user_id = $1
            ORDER BY cs.submitted_at DESC
        `, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/* ─────────────────────────────────────────────────────────────────
   POST /api/challenges/:id/submit
   Student submits proof for a challenge
───────────────────────────────────────────────────────────────── */
router.post('/:id/submit', authenticateToken, async (req, res) => {
    try {
        const { description, proof_url } = req.body;
        if (!description || description.trim().length < 10) {
            return res.status(400).json({ error: 'Please provide a description of at least 10 characters.' });
        }

        // Check challenge exists and is active
        const challenge = await pool.query(
            'SELECT * FROM challenges WHERE id = $1 AND is_active = TRUE',
            [req.params.id]
        );
        if (challenge.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found or inactive' });
        }

        // Upsert: allow re-submission if previously rejected
        const result = await pool.query(`
            INSERT INTO challenge_submissions (challenge_id, user_id, description, proof_url, status)
            VALUES ($1, $2, $3, $4, 'pending')
            ON CONFLICT (challenge_id, user_id)
            DO UPDATE SET
                description  = EXCLUDED.description,
                proof_url    = EXCLUDED.proof_url,
                status       = 'pending',
                admin_note   = NULL,
                reviewed_by  = NULL,
                reviewed_at  = NULL,
                submitted_at = NOW()
            RETURNING *
        `, [req.params.id, req.user.id, description.trim(), proof_url?.trim() || null]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
