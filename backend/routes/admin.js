const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const adminOnly = [authenticateToken, requireRole('super_admin')];

/* ─────────────────────────────────────────────────────────────────
   OVERVIEW / STATS
───────────────────────────────────────────────────────────────── */
router.get('/stats', ...adminOnly, async (req, res) => {
    try {
        const [users, challenges, pending, approvedToday, totalSubs, pendingTeachers] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM users WHERE role = 'student'`),
            pool.query(`SELECT COUNT(*) FROM challenges WHERE is_active = TRUE`),
            pool.query(`SELECT COUNT(*) FROM challenge_submissions WHERE status = 'pending'`),
            pool.query(`
                SELECT COUNT(*) FROM challenge_submissions
                WHERE status = 'approved'
                  AND reviewed_at >= CURRENT_DATE
            `),
            pool.query(`SELECT COUNT(*) FROM challenge_submissions`),
            pool.query(`SELECT COUNT(*) FROM users WHERE role = 'teacher' AND is_approved = FALSE`),
        ]);

        res.json({
            total_students:    parseInt(users.rows[0].count),
            active_challenges: parseInt(challenges.rows[0].count),
            pending_reviews:   parseInt(pending.rows[0].count),
            approved_today:    parseInt(approvedToday.rows[0].count),
            total_submissions: parseInt(totalSubs.rows[0].count),
            pending_teachers:  parseInt(pendingTeachers.rows[0].count),
        });
    } catch (err) {
        console.error('Admin stats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

/* ─────────────────────────────────────────────────────────────────
   CHALLENGES  CRUD
───────────────────────────────────────────────────────────────── */

// List all challenges with submission counts
router.get('/challenges', ...adminOnly, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                c.*,
                u.name                                              AS created_by_name,
                COUNT(cs.id)                                        AS total_submissions,
                COUNT(cs.id) FILTER (WHERE cs.status = 'pending')  AS pending_count,
                COUNT(cs.id) FILTER (WHERE cs.status = 'approved') AS approved_count,
                COUNT(cs.id) FILTER (WHERE cs.status = 'rejected') AS rejected_count
            FROM challenges c
            LEFT JOIN users u ON c.created_by = u.id
            LEFT JOIN challenge_submissions cs ON cs.challenge_id = c.id
            GROUP BY c.id, u.name
            ORDER BY c.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create challenge
router.post('/challenges', ...adminOnly, async (req, res) => {
    try {
        const { title, description, category, difficulty, points, deadline } = req.body;
        const result = await pool.query(`
            INSERT INTO challenges (title, description, category, difficulty, points, deadline, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [title, description, category || 'General', difficulty || 'medium', points || 50, deadline || null, req.user.id]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update challenge
router.patch('/challenges/:id', ...adminOnly, async (req, res) => {
    try {
        const { title, description, category, difficulty, points, is_active, deadline } = req.body;
        const result = await pool.query(`
            UPDATE challenges
            SET title       = COALESCE($1, title),
                description = COALESCE($2, description),
                category    = COALESCE($3, category),
                difficulty  = COALESCE($4, difficulty),
                points      = COALESCE($5, points),
                is_active   = COALESCE($6, is_active),
                deadline    = COALESCE($7, deadline)
            WHERE id = $8
            RETURNING *
        `, [title, description, category, difficulty, points, is_active, deadline, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Challenge not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete challenge
router.delete('/challenges/:id', ...adminOnly, async (req, res) => {
    try {
        await pool.query('DELETE FROM challenges WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/* ─────────────────────────────────────────────────────────────────
   SUBMISSIONS  REVIEW
───────────────────────────────────────────────────────────────── */

// List submissions (filter by status optional)
router.get('/submissions', ...adminOnly, async (req, res) => {
    try {
        const { status } = req.query;
        const params = [];
        let where = '';
        if (status && ['pending','approved','rejected'].includes(status)) {
            params.push(status);
            where = `WHERE cs.status = $1`;
        }

        const result = await pool.query(`
            SELECT
                cs.*,
                u.name        AS student_name,
                u.email       AS student_email,
                c.title       AS challenge_title,
                c.points      AS challenge_points,
                c.difficulty  AS challenge_difficulty,
                rev.name      AS reviewer_name
            FROM challenge_submissions cs
            JOIN users      u   ON cs.user_id      = u.id
            JOIN challenges c   ON cs.challenge_id = c.id
            LEFT JOIN users rev ON cs.reviewed_by  = rev.id
            ${where}
            ORDER BY
                CASE cs.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
                cs.submitted_at DESC
        `, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Approve or reject a submission
router.patch('/submissions/:id/review', ...adminOnly, async (req, res) => {
    try {
        const { status, admin_note } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'status must be approved or rejected' });
        }

        const result = await pool.query(`
            UPDATE challenge_submissions
            SET status      = $1,
                admin_note  = $2,
                reviewed_by = $3,
                reviewed_at = NOW()
            WHERE id = $4
            RETURNING *
        `, [status, admin_note || null, req.user.id, req.params.id]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'Submission not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/* ─────────────────────────────────────────────────────────────────
   USERS  MONITOR
───────────────────────────────────────────────────────────────── */
router.get('/users', ...adminOnly, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id, u.name, u.email, u.role, u.is_approved, u.created_at,
                COALESCE(b.badge_count, 0)          AS badge_count,
                COALESCE(p.total_lessons, 0)         AS total_lessons,
                COALESCE(p.avg_quiz, 0)              AS avg_quiz_score,
                COALESCE(ch.approved_challenges, 0)  AS approved_challenges,
                COALESCE(ch.pending_challenges, 0)   AS pending_challenges
            FROM users u
            LEFT JOIN (
                SELECT user_id, COUNT(*) AS badge_count FROM user_badges GROUP BY user_id
            ) b ON b.user_id = u.id
            LEFT JOIN (
                SELECT user_id,
                       SUM(completed_lessons)   AS total_lessons,
                       ROUND(AVG(quiz_score))   AS avg_quiz
                FROM progress GROUP BY user_id
            ) p ON p.user_id = u.id
            LEFT JOIN (
                SELECT user_id,
                       COUNT(*) FILTER (WHERE status = 'approved') AS approved_challenges,
                       COUNT(*) FILTER (WHERE status = 'pending')  AS pending_challenges
                FROM challenge_submissions GROUP BY user_id
            ) ch ON ch.user_id = u.id
            ORDER BY u.role, u.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/* ─────────────────────────────────────────────────────────────────
   TEACHER APPROVAL
───────────────────────────────────────────────────────────────── */

// Get teachers pending approval
router.get('/pending-teachers', ...adminOnly, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, created_at
            FROM users
            WHERE role = 'teacher' AND is_approved = FALSE
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Approve or reject a teacher
router.patch('/teachers/:id/approve', ...adminOnly, async (req, res) => {
    try {
        const { approved } = req.body; // true = approve, false = reject (delete)
        if (typeof approved !== 'boolean') {
            return res.status(400).json({ error: 'approved must be true or false' });
        }

        if (approved) {
            const result = await pool.query(
                'UPDATE users SET is_approved = TRUE WHERE id = $1 AND role = $2 RETURNING id, name, email, role, is_approved',
                [req.params.id, 'teacher']
            );
            if (result.rows.length === 0) return res.status(404).json({ error: 'Teacher not found' });
            res.json(result.rows[0]);
        } else {
            // Reject = delete the unapproved teacher account
            await pool.query('DELETE FROM users WHERE id = $1 AND role = $2 AND is_approved = FALSE', [req.params.id, 'teacher']);
            res.json({ success: true, message: 'Teacher account rejected and removed' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

