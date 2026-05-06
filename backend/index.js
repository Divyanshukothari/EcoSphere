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
app.use(cors());
app.use(express.json());

app.use('/api/auth',        authRoutes);
app.use('/api/courses',     coursesRoutes);
app.use('/api/progress',    progressRoutes);
app.use('/api/badges',      badgesRoutes);
app.use('/api/chat',        chatRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/challenges',  challengesRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
