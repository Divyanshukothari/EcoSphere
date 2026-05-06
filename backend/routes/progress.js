const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const checkBadges = async (userId, courseId) => {
    const unlockedBadges = [];
    try {
        const progressRes = await pool.query('SELECT * FROM progress WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
        if (progressRes.rows.length === 0) return [];
        const progress = progressRes.rows[0];

        const badgesRes = await pool.query('SELECT * FROM badges WHERE course_id = $1', [courseId]);
        
        for (const badge of badgesRes.rows) {
            let conditionMet = false;
            if (badge.condition_type === 'LESSONS' && progress.completed_lessons >= badge.condition_value) {
                conditionMet = true;
            } else if (badge.condition_type === 'QUIZ' && progress.quiz_score >= badge.condition_value) {
                conditionMet = true;
            }

            if (conditionMet) {
                const checkUserBadge = await pool.query(
                    'SELECT * FROM user_badges WHERE user_id = $1 AND badge_id = $2',
                    [userId, badge.id]
                );
                
                if (checkUserBadge.rows.length === 0) {
                    await pool.query(
                        'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)',
                        [userId, badge.id]
                    );
                    unlockedBadges.push(badge);
                }
            }
        }
    } catch (err) {
        console.error('Error checking badges', err);
    }
    return unlockedBadges;
};

router.post('/lesson', authenticateToken, async (req, res) => {
    try {
        const { course_id } = req.body;
        const userId = req.user.id;

        const exists = await pool.query('SELECT * FROM progress WHERE user_id = $1 AND course_id = $2', [userId, course_id]);
        
        let newCompleted = 1;
        if (exists.rows.length === 0) {
            await pool.query(
                'INSERT INTO progress (user_id, course_id, completed_lessons) VALUES ($1, $2, 1)',
                [userId, course_id]
            );
        } else {
            const current = exists.rows[0].completed_lessons;
            newCompleted = current + 1;
            await pool.query(
                'UPDATE progress SET completed_lessons = $1 WHERE user_id = $2 AND course_id = $3',
                [newCompleted, userId, course_id]
            );
        }

        const newBadges = await checkBadges(userId, course_id);
        res.json({ success: true, completed_lessons: newCompleted, unlocked_badges: newBadges });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/quiz', authenticateToken, async (req, res) => {
    try {
        const { course_id, quiz_id, answers } = req.body; 
        const userId = req.user.id;

        const optionsRes = await pool.query(
            'SELECT o.id, o.is_correct, o.question_id FROM options o JOIN questions q ON o.question_id = q.id WHERE q.quiz_id = $1',
            [quiz_id]
        );

        let correctCount = 0;
        let totalCount = 0;

        const correctOptionsMap = {};
        optionsRes.rows.forEach(opt => {
            if (opt.is_correct) correctOptionsMap[opt.question_id] = opt.id;
        });

        const questionsRes = await pool.query('SELECT id FROM questions WHERE quiz_id = $1', [quiz_id]);
        totalCount = questionsRes.rows.length;

        for (const [qId, optId] of Object.entries(answers)) {
            if (correctOptionsMap[qId] === optId) {
                correctCount++;
            }
        }

        const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

        const exists = await pool.query('SELECT * FROM progress WHERE user_id = $1 AND course_id = $2', [userId, course_id]);
        if (exists.rows.length === 0) {
            await pool.query(
                'INSERT INTO progress (user_id, course_id, quiz_score) VALUES ($1, $2, $3)',
                [userId, course_id, score]
            );
        } else {
            await pool.query(
                'UPDATE progress SET quiz_score = $1 WHERE user_id = $2 AND course_id = $3',
                [score, userId, course_id]
            );
        }

        const newBadges = await checkBadges(userId, course_id);
        res.json({ success: true, score, unlocked_badges: newBadges });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:course_id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM progress WHERE user_id = $1 AND course_id = $2',
            [req.user.id, req.params.course_id]
        );
        res.json(result.rows[0] || { completed_lessons: 0, quiz_score: 0 });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
