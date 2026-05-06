import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './pages/LandingPage';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';

import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import CourseDetail from './pages/CourseDetail';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateCourse from './pages/CreateCourse';
import AddLesson from './pages/AddLesson';
import AddQuiz from './pages/AddQuiz';
import AddBadges from './pages/AddBadges';
import ChatPage from './pages/ChatPage';
import Leaderboard from './pages/Leaderboard';
import ChallengesPage from './pages/ChallengesPage';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>
                    <ToastContainer />
                    <ChatWidget />
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Student Routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
                        } />
                        <Route path="/courses/:id" element={
                            <ProtectedRoute role="student"><CourseDetail /></ProtectedRoute>
                        } />
                        <Route path="/courses/:courseId/lessons/:lessonId" element={
                            <ProtectedRoute role="student"><LessonPage /></ProtectedRoute>
                        } />
                        <Route path="/courses/:courseId/quiz" element={
                            <ProtectedRoute role="student"><QuizPage /></ProtectedRoute>
                        } />
                        <Route path="/chat" element={
                            <ProtectedRoute role="student"><ChatPage /></ProtectedRoute>
                        } />
                        <Route path="/leaderboard" element={
                            <ProtectedRoute role="student"><Leaderboard /></ProtectedRoute>
                        } />
                        <Route path="/challenges" element={
                            <ProtectedRoute role="student"><ChallengesPage /></ProtectedRoute>
                        } />

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={
                            <ProtectedRoute role="super_admin"><AdminPanel /></ProtectedRoute>
                        } />

                        {/* Teacher Routes */}
                        <Route path="/teacher" element={
                            <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
                        } />
                        <Route path="/teacher/create-course" element={
                            <ProtectedRoute role="teacher"><CreateCourse /></ProtectedRoute>
                        } />
                        <Route path="/teacher/course/:courseId/add-lesson" element={
                            <ProtectedRoute role="teacher"><AddLesson /></ProtectedRoute>
                        } />
                        <Route path="/teacher/course/:courseId/add-quiz" element={
                            <ProtectedRoute role="teacher"><AddQuiz /></ProtectedRoute>
                        } />
                        <Route path="/teacher/course/:courseId/add-badges" element={
                            <ProtectedRoute role="teacher"><AddBadges /></ProtectedRoute>
                        } />

                        {/* Catch-all */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
