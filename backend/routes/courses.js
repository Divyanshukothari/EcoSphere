const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Middleware: check if teacher is approved before allowing write operations
const requireApproved = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT is_approved FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        if (!result.rows[0].is_approved) {
            return res.status(403).json({ error: 'Your teacher account is pending admin approval. You cannot create content yet.' });
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all courses
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, u.name as instructor_name 
            FROM courses c 
            JOIN users u ON c.created_by = u.id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get course by id
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const course = await pool.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
        if (course.rows.length === 0) return res.status(404).json({ error: 'Course not found' });

        const lessons = await pool.query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index', [req.params.id]);
        const quizzes = await pool.query('SELECT * FROM quizzes WHERE course_id = $1', [req.params.id]);

        let quizData = quizzes.rows[0];
        if (quizData) {
            const questions = await pool.query('SELECT * FROM questions WHERE quiz_id = $1', [quizData.id]);
            for (let q of questions.rows) {
                const options = await pool.query('SELECT id, option_text FROM options WHERE question_id = $1', [q.id]);
                q.options = options.rows;
            }
            quizData.questions = questions.rows;
        }

        const courseDetails = {
            ...course.rows[0],
            lessons: lessons.rows,
            quiz: quizData || null
        };
        res.json(courseDetails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a course (requires approved teacher)
router.post('/', authenticateToken, requireRole('teacher'), requireApproved, async (req, res) => {
    try {
        const { title, description } = req.body;
        const result = await pool.query(
            'INSERT INTO courses (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
            [title, description, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add lesson (requires approved teacher)
router.post('/:id/lessons', authenticateToken, requireRole('teacher'), requireApproved, async (req, res) => {
    try {
        const { title, content, order_index } = req.body;
        const result = await pool.query(
            'INSERT INTO lessons (course_id, title, content, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.params.id, title, content, order_index]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add quiz (requires approved teacher)
router.post('/:id/quizzes', authenticateToken, requireRole('teacher'), requireApproved, async (req, res) => {
    try {
        const { title, questions } = req.body; 
        
        await pool.query('BEGIN');
        
        const quizResult = await pool.query(
            'INSERT INTO quizzes (course_id, title) VALUES ($1, $2) RETURNING *',
            [req.params.id, title]
        );
        const quizId = quizResult.rows[0].id;

        for (let q of questions) {
            const qResult = await pool.query(
                'INSERT INTO questions (quiz_id, question_text) VALUES ($1, $2) RETURNING *',
                [quizId, q.text]
            );
            const questionId = qResult.rows[0].id;

            for (let opt of q.options) {
                await pool.query(
                    'INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)',
                    [questionId, opt.text, opt.is_correct]
                );
            }
        }
        
        await pool.query('COMMIT');
        res.status(201).json(quizResult.rows[0]);
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a course (only the teacher who created it)
router.delete('/:id', authenticateToken, requireRole('teacher'), requireApproved, async (req, res) => {
    try {
        // Verify ownership
        const check = await pool.query('SELECT created_by FROM courses WHERE id = $1', [req.params.id]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
        if (check.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own courses' });
        }

        await pool.query('BEGIN');

        // Cascade delete in correct order (FK constraints)
        // 1. Delete options → questions → quizzes
        await pool.query(`
            DELETE FROM options WHERE question_id IN (
                SELECT q.id FROM questions q
                JOIN quizzes qz ON q.quiz_id = qz.id
                WHERE qz.course_id = $1
            )`, [req.params.id]);
        await pool.query(`
            DELETE FROM questions WHERE quiz_id IN (
                SELECT id FROM quizzes WHERE course_id = $1
            )`, [req.params.id]);
        await pool.query('DELETE FROM quizzes WHERE course_id = $1', [req.params.id]);

        // 2. Delete lessons
        await pool.query('DELETE FROM lessons WHERE course_id = $1', [req.params.id]);

        // 3. Delete progress records
        await pool.query('DELETE FROM progress WHERE course_id = $1', [req.params.id]);

        // 4. Delete badges linked to this course
        await pool.query('DELETE FROM badges WHERE course_id = $1', [req.params.id]);

        // 5. Delete the course itself
        await pool.query('DELETE FROM courses WHERE id = $1', [req.params.id]);

        await pool.query('COMMIT');
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
