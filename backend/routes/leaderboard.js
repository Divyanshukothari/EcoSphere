const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/leaderboard
 * Composite score = (badges × 20) + avg_quiz_score + (lessons × 5) + challenge_points
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id,
                u.name,
                COALESCE(badge_counts.badge_count, 0)          AS badge_count,
                COALESCE(progress_agg.avg_quiz_score, 0)        AS avg_quiz_score,
                COALESCE(progress_agg.total_lessons, 0)         AS total_lessons,
                COALESCE(challenge_pts.total_challenge_pts, 0)  AS challenge_points,
                (
                    COALESCE(badge_counts.badge_count, 0) * 20 +
                    COALESCE(progress_agg.avg_quiz_score, 0)    +
                    COALESCE(progress_agg.total_lessons, 0) * 5 +
                    COALESCE(challenge_pts.total_challenge_pts, 0)
                )                                               AS total_score
            FROM users u
            LEFT JOIN (
                SELECT user_id, COUNT(*) AS badge_count
                FROM user_badges
                GROUP BY user_id
            ) badge_counts ON badge_counts.user_id = u.id
            LEFT JOIN (
                SELECT
                    user_id,
                    ROUND(AVG(quiz_score))  AS avg_quiz_score,
                    SUM(completed_lessons)  AS total_lessons
                FROM progress
                GROUP BY user_id
            ) progress_agg ON progress_agg.user_id = u.id
            LEFT JOIN (
                SELECT cs.user_id, SUM(c.points) AS total_challenge_pts
                FROM challenge_submissions cs
                JOIN challenges c ON cs.challenge_id = c.id
                WHERE cs.status = 'approved'
                GROUP BY cs.user_id
            ) challenge_pts ON challenge_pts.user_id = u.id
            WHERE u.role = 'student'
            ORDER BY total_score DESC, badge_count DESC, u.name ASC
        `);

        const leaderboard = result.rows.map((row, index) => ({
            rank:              index + 1,
            id:                row.id,
            name:              row.name,
            badge_count:       parseInt(row.badge_count),
            avg_quiz_score:    parseFloat(row.avg_quiz_score),
            total_lessons:     parseInt(row.total_lessons),
            challenge_points:  parseFloat(row.challenge_points),
            total_score:       parseFloat(row.total_score),
        }));

        const myEntry = leaderboard.find(entry => entry.id === req.user.id) || null;
        res.json({ leaderboard, myRank: myEntry });
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
