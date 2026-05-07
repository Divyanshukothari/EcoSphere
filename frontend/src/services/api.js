const API_URL = 'https://eco-sphere-jd5d.vercel.app/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
};

export const api = {
    async register(data) {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async login(data) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async getProfile() {
        const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
    },
    async getCourses() {
        const res = await fetch(`${API_URL}/courses`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async getCourse(id) {
        const res = await fetch(`${API_URL}/courses/${id}`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async createCourse(data) {
        const res = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async completeLesson(courseId) {
        const res = await fetch(`${API_URL}/progress/lesson`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ course_id: courseId })
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async submitQuiz(courseId, quizId, answers) {
        const res = await fetch(`${API_URL}/progress/quiz`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ course_id: courseId, quiz_id: quizId, answers })
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async getProgress(courseId) {
        const res = await fetch(`${API_URL}/progress/${courseId}`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async getUserBadges() {
        const res = await fetch(`${API_URL}/badges/user`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // ── Chat Sessions ─────────────────────────────────────────────────────────
    async getChatSessions() {
        const res = await fetch(`${API_URL}/chat/sessions`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async createChatSession(title = 'New Chat') {
        const res = await fetch(`${API_URL}/chat/sessions`, {
            method: 'POST', headers: getHeaders(),
            body: JSON.stringify({ title })
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async deleteChatSession(sessionId) {
        const res = await fetch(`${API_URL}/chat/sessions/${sessionId}`, {
            method: 'DELETE', headers: getHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async renameChatSession(sessionId, title) {
        const res = await fetch(`${API_URL}/chat/sessions/${sessionId}`, {
            method: 'PATCH', headers: getHeaders(),
            body: JSON.stringify({ title })
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async getSessionMessages(sessionId) {
        const res = await fetch(`${API_URL}/chat/sessions/${sessionId}/messages`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async sendMessage(sessionId, message) {
        const res = await fetch(`${API_URL}/chat/sessions/${sessionId}/message`, {
            method: 'POST', headers: getHeaders(),
            body: JSON.stringify({ message })
        });
        const data = await res.json();
        if (!res.ok) throw { status: res.status, ...data };
        return data;
    },
    async getChatUsage() {
        const res = await fetch(`${API_URL}/chat/usage`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // ── Leaderboard ───────────────────────────────────────────────────────────
    async getLeaderboard() {
        const res = await fetch(`${API_URL}/leaderboard`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // ── Challenges (student) ──────────────────────────────────────────────────
    async getChallenges() {
        const res = await fetch(`${API_URL}/challenges`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async submitChallenge(challengeId, description, proof_url) {
        const res = await fetch(`${API_URL}/challenges/${challengeId}/submit`, {
            method: 'POST', headers: getHeaders(),
            body: JSON.stringify({ description, proof_url })
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async getMySubmissions() {
        const res = await fetch(`${API_URL}/challenges/my-submissions`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // ── Admin ─────────────────────────────────────────────────────────────────
    async adminGetStats() {
        const res = await fetch(`${API_URL}/admin/stats`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async adminGetChallenges() {
        const res = await fetch(`${API_URL}/admin/challenges`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async adminCreateChallenge(data) {
        const res = await fetch(`${API_URL}/admin/challenges`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async adminUpdateChallenge(id, data) {
        const res = await fetch(`${API_URL}/admin/challenges/${id}`, {
            method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async adminDeleteChallenge(id) {
        const res = await fetch(`${API_URL}/admin/challenges/${id}`, {
            method: 'DELETE', headers: getHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async adminGetSubmissions(status) {
        const url = status
            ? `${API_URL}/admin/submissions?status=${status}`
            : `${API_URL}/admin/submissions`;
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async adminReviewSubmission(id, status, admin_note) {
        const res = await fetch(`${API_URL}/admin/submissions/${id}/review`, {
            method: 'PATCH', headers: getHeaders(),
            body: JSON.stringify({ status, admin_note })
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async adminGetUsers() {
        const res = await fetch(`${API_URL}/admin/users`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async adminGetPendingTeachers() {
        const res = await fetch(`${API_URL}/admin/pending-teachers`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async adminApproveTeacher(id, approved) {
        const res = await fetch(`${API_URL}/admin/teachers/${id}/approve`, {
            method: 'PATCH', headers: getHeaders(),
            body: JSON.stringify({ approved })
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
};
