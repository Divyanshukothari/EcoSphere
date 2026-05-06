import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Leaf, LogOut, Plus, BookOpen, PenSquare, Clock, ShieldAlert } from 'lucide-react';

const TeacherNavbar = () => {
    const { user, logout } = useAuth();
    return (
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Leaf size={16} className="text-white" />
                    </div>
                    <div>
                        <span className="font-display font-bold text-slate-800 text-lg">EcoSphere</span>
                        <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Teacher</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 hidden sm:block">👋 {user?.name}</span>
                    <button onClick={logout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors">
                        <LogOut size={15} /> Sign out
                    </button>
                </div>
            </div>
        </nav>
    );
};

const TeacherDashboard = () => {
    const { user } = useAuth();
    const isApproved = user?.is_approved !== false;
    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: api.getCourses
    });

    const myCourses = courses.filter(c => c.created_by === user?.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/20">
            <TeacherNavbar />
            <main className="max-w-6xl mx-auto px-6 py-10">

                {/* Pending Approval Banner */}
                {!isApproved && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Clock size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-amber-800 text-base mb-1">Account Pending Approval</h3>
                            <p className="text-amber-700 text-sm leading-relaxed">
                                Your teacher account is awaiting approval from a super admin. You can browse existing courses but cannot create new content until your account is approved.
                            </p>
                        </div>
                    </div>
                )}

                {/* Hero */}
                <div className="mb-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-violet-200/60 relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
                    <p className="text-violet-200 text-sm font-medium mb-1">Teacher Portal 🧑‍🏫</p>
                    <h1 className="font-display font-bold text-3xl mb-1">{user?.name}</h1>
                    <p className="text-violet-200 text-sm">Manage your courses and help students grow</p>
                    {isApproved ? (
                        <div className="mt-6">
                            <Link
                                to="/teacher/create-course"
                                className="inline-flex items-center gap-2 bg-white text-violet-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-violet-50 transition-colors shadow-md text-sm"
                            >
                                <Plus size={16} /> Create New Course
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-6 flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2.5 w-fit">
                            <ShieldAlert size={16} className="text-amber-300" />
                            <span className="text-violet-100 text-sm">Account awaiting admin approval</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 mb-5">
                    <BookOpen size={20} className="text-violet-500" />
                    <h2 className="font-display font-bold text-xl text-slate-800">My Courses ({myCourses.length})</h2>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1,2,3].map(i => <div key={i} className="glass-card p-5 h-20 animate-pulse" />)}
                    </div>
                ) : myCourses.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <p className="text-5xl mb-4">📚</p>
                        <p className="text-lg font-medium">No courses yet</p>
                        <p className="text-sm mb-4">Create your first course to get started</p>
                        <Link to="/teacher/create-course" className="btn-primary inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700">
                            <Plus size={15} /> Create Course
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {myCourses.map(course => (
                            <div key={course.id} className="glass-card p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                        <BookOpen size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 text-sm">{course.title}</h3>
                                        <p className="text-xs text-slate-500 line-clamp-1 max-w-lg">{course.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link to={`/teacher/course/${course.id}/add-lesson`} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                                        <Plus size={13} /> Lesson
                                    </Link>
                                    <Link to={`/teacher/course/${course.id}/add-quiz`} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
                                        <PenSquare size={13} /> Quiz
                                    </Link>
                                    <Link to={`/teacher/course/${course.id}/add-badges`} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors">
                                        🏅 Badges
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TeacherDashboard;
