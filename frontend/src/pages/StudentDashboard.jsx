import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CourseCard from '../components/CourseCard';
import {
    Leaf, LogOut, MessageCircle, Trophy, Target, BookOpen,
    Award, ChevronRight, Flame, Star, Zap, Medal
} from 'lucide-react';

const DIFF_COLOR = {
    easy:   'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard:   'bg-red-100 text-red-700',
};

const STATUS_STYLE = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending:  'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-600',
};

const Navbar = () => {
    const { user, logout } = useAuth();
    return (
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-slate-100 px-6 py-3.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                        <Leaf size={15} className="text-white" />
                    </div>
                    <span className="font-bold text-slate-800 text-lg tracking-tight">EcoSphere</span>
                </div>
                <div className="flex items-center gap-1">
                    {[
                        { to: '/chat',        icon: <MessageCircle size={14}/>, label: 'EcoBot',      color: 'hover:text-emerald-600 hover:bg-emerald-50' },
                        { to: '/leaderboard', icon: <Trophy size={14}/>,        label: 'Leaderboard', color: 'hover:text-amber-600 hover:bg-amber-50' },
                        { to: '/challenges',  icon: <Target size={14}/>,        label: 'Challenges',  color: 'hover:text-green-600 hover:bg-green-50' },
                        { to: '/courses',     icon: <BookOpen size={14}/>,      label: 'Courses',     color: 'hover:text-blue-600 hover:bg-blue-50' },
                    ].map(({ to, icon, label, color }) => (
                        <Link key={to} to={to} className={`flex items-center gap-1.5 text-xs font-medium text-slate-500 px-3 py-2 rounded-lg transition-colors ${color}`}>
                            {icon} {label}
                        </Link>
                    ))}
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <span className="text-xs text-slate-500 px-2 hidden sm:block">👋 {user?.name}</span>
                    <button onClick={logout} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
                        <LogOut size={14}/> Sign out
                    </button>
                </div>
            </div>
        </nav>
    );
};

const RankBadge = ({ rank }) => {
    if (rank === 1) return <span className="text-lg">🥇</span>;
    if (rank === 2) return <span className="text-lg">🥈</span>;
    if (rank === 3) return <span className="text-lg">🥉</span>;
    return <span className="text-xs font-bold text-slate-500 w-6 text-center">#{rank}</span>;
};

export default function StudentDashboard() {
    const { user } = useAuth();

    const { data: courses = [], isLoading: coursesLoading } = useQuery({ queryKey: ['courses'], queryFn: api.getCourses });
    const { data: userBadges = [] } = useQuery({ queryKey: ['userBadges'], queryFn: api.getUserBadges });
    const { data: leaderboardData } = useQuery({ queryKey: ['leaderboard'], queryFn: api.getLeaderboard, staleTime: 60000 });
    const { data: challenges = [] } = useQuery({ queryKey: ['challenges'], queryFn: api.getChallenges, staleTime: 30000 });

    const leaderboard = leaderboardData?.leaderboard?.slice(0, 5) || [];
    const myRank = leaderboardData?.myRank;

    const activeChallenges = challenges.filter(c => !c.submission_status).slice(0, 3);
    const doneChallenges   = challenges.filter(c => c.submission_status === 'approved').length;
    const pendingChallenges = challenges.filter(c => c.submission_status === 'pending').length;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* ── Hero Banner ─────────────────────────────────────── */}
                <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-2xl shadow-emerald-200/50">
                    {/* decorative blobs */}
                    <div className="absolute -right-12 -top-12 w-56 h-56 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute right-32 bottom-0 w-32 h-32 bg-white/5 rounded-full" />
                    <div className="absolute left-1/2 top-0 w-px h-full bg-white/5" />

                    <div className="relative px-8 py-8 flex items-center justify-between gap-6 flex-wrap">
                        <div>
                            <p className="text-emerald-200 text-sm font-medium mb-1 flex items-center gap-1.5">
                                <Leaf size={13}/> Welcome back
                            </p>
                            <h1 className="font-bold text-3xl sm:text-4xl mb-3 tracking-tight">{user?.name} 👋</h1>
                            <p className="text-emerald-100 text-sm mb-5">Keep learning, keep earning — your planet needs you.</p>
                            <div className="flex gap-3 flex-wrap">
                                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10">
                                    <p className="text-2xl font-bold">{courses.length}</p>
                                    <p className="text-emerald-200 text-xs">Courses</p>
                                </div>
                                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10">
                                    <p className="text-2xl font-bold">{userBadges.length}</p>
                                    <p className="text-emerald-200 text-xs">Badges</p>
                                </div>
                                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10">
                                    <p className="text-2xl font-bold">{doneChallenges}</p>
                                    <p className="text-emerald-200 text-xs">Completed</p>
                                </div>
                                {myRank && (
                                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10">
                                        <p className="text-2xl font-bold">#{myRank.rank}</p>
                                        <p className="text-emerald-200 text-xs">Rank</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="hidden lg:flex flex-col gap-2 items-end">
                            <Link to="/challenges" className="flex items-center gap-2 bg-white text-emerald-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                                <Target size={15}/> View All Challenges
                            </Link>
                            <Link to="/leaderboard" className="flex items-center gap-2 bg-white/15 border border-white/20 text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-white/25 transition-all active:scale-95">
                                <Trophy size={15}/> See Leaderboard
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Main Grid ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN (2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Active Challenges */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                                        <Target size={15} className="text-white"/>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-800 text-sm">Active Challenges</h2>
                                        <p className="text-slate-400 text-[10px]">{challenges.length} available · {pendingChallenges} pending review</p>
                                    </div>
                                </div>
                                <Link to="/challenges" className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                                    View all <ChevronRight size={13}/>
                                </Link>
                            </div>

                            {activeChallenges.length === 0 ? (
                                <div className="px-5 py-10 text-center">
                                    <p className="text-3xl mb-2">🎉</p>
                                    <p className="text-slate-500 text-sm font-medium">All caught up!</p>
                                    <p className="text-slate-400 text-xs mt-1">No new challenges right now.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {activeChallenges.map(c => (
                                        <div key={c.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/70 transition-colors group">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-lg flex-shrink-0">
                                                {c.difficulty === 'easy' ? '🌱' : c.difficulty === 'hard' ? '🔥' : '🎯'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="font-semibold text-slate-800 text-sm truncate">{c.title}</p>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${DIFF_COLOR[c.difficulty] || DIFF_COLOR.medium}`}>
                                                        {c.difficulty}
                                                    </span>
                                                </div>
                                                <p className="text-slate-400 text-xs truncate">{c.description}</p>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <div className="text-right">
                                                    <p className="font-bold text-emerald-600 text-sm">{c.points}</p>
                                                    <p className="text-[10px] text-slate-400">pts</p>
                                                </div>
                                                <Link to="/challenges" className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-500">
                                                    Submit
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Submission status strip */}
                            {(doneChallenges > 0 || pendingChallenges > 0) && (
                                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex gap-4">
                                    {doneChallenges > 0 && (
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"/>
                                            {doneChallenges} approved
                                        </div>
                                    )}
                                    {pendingChallenges > 0 && (
                                        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                                            <span className="w-2 h-2 rounded-full bg-amber-400"/>
                                            {pendingChallenges} pending review
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Courses */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                        <BookOpen size={15} className="text-white"/>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-800 text-sm">Courses</h2>
                                        <p className="text-slate-400 text-[10px]">{courses.length} available</p>
                                    </div>
                                </div>
                            </div>
                            {coursesLoading ? (
                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="border border-slate-100 rounded-xl p-4 animate-pulse">
                                            <div className="w-10 h-10 bg-slate-200 rounded-xl mb-3"/>
                                            <div className="h-3 bg-slate-200 rounded mb-2"/>
                                            <div className="h-2.5 bg-slate-100 rounded w-2/3"/>
                                        </div>
                                    ))}
                                </div>
                            ) : courses.length === 0 ? (
                                <div className="py-16 text-center text-slate-400">
                                    <p className="text-4xl mb-3">📚</p>
                                    <p className="text-sm font-medium">No courses yet</p>
                                    <p className="text-xs mt-1">Check back soon!</p>
                                </div>
                            ) : (
                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {courses.map(course => <CourseCard key={course.id} course={course} />)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (1/3) */}
                    <div className="space-y-6">

                        {/* Leaderboard Preview */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                        <Trophy size={15} className="text-white"/>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-800 text-sm">Leaderboard</h2>
                                        <p className="text-slate-400 text-[10px]">Top performers</p>
                                    </div>
                                </div>
                                <Link to="/leaderboard" className="flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors">
                                    Full <ChevronRight size={13}/>
                                </Link>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {leaderboard.length === 0 ? (
                                    <div className="py-10 text-center text-slate-400 text-xs">Loading rankings...</div>
                                ) : (
                                    leaderboard.map((entry) => {
                                        const isMe = entry.id === user?.id;
                                        return (
                                            <div key={entry.id} className={`flex items-center gap-3 px-5 py-3 transition-colors ${isMe ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                                                <RankBadge rank={entry.rank} />
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isMe ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                    {entry.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-semibold truncate ${isMe ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                        {entry.name} {isMe && <span className="text-[10px] font-normal">(you)</span>}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">{entry.badge_count} badges · {entry.challenge_points} pts</p>
                                                </div>
                                                <div className={`text-xs font-bold ${isMe ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                    {Math.round(entry.total_score)}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* My rank strip */}
                            {myRank && !leaderboard.find(e => e.id === user?.id) && (
                                <div className="px-5 py-3 bg-emerald-50 border-t border-emerald-100 flex items-center gap-3">
                                    <span className="text-xs text-slate-500">Your rank:</span>
                                    <span className="font-bold text-emerald-600 text-sm">#{myRank.rank}</span>
                                    <span className="text-xs text-slate-400 ml-auto">{Math.round(myRank.total_score)} pts</span>
                                </div>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Medal size={15} className="text-white"/>
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 text-sm">My Badges</h2>
                                    <p className="text-slate-400 text-[10px]">{userBadges.length} earned</p>
                                </div>
                            </div>
                            {userBadges.length === 0 ? (
                                <div className="py-10 text-center text-slate-400">
                                    <p className="text-3xl mb-2">🏅</p>
                                    <p className="text-xs font-medium">No badges yet</p>
                                    <p className="text-[10px] mt-1">Complete lessons to earn badges</p>
                                </div>
                            ) : (
                                <div className="p-4 flex flex-wrap gap-2">
                                    {userBadges.map(badge => (
                                        <div key={badge.id} className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 px-3 py-1.5 rounded-xl">
                                            <span className="text-base">🏅</span>
                                            <span className="text-xs font-semibold text-purple-700">{badge.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick links */}
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/chat" className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl p-4 flex flex-col gap-2 hover:shadow-lg hover:shadow-emerald-200/60 transition-all hover:-translate-y-0.5 active:scale-95">
                                <span className="text-2xl">🌿</span>
                                <p className="font-bold text-sm">Ask EcoBot</p>
                                <p className="text-emerald-100 text-[10px]">AI assistant</p>
                            </Link>
                            <Link to="/challenges" className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-2xl p-4 flex flex-col gap-2 hover:shadow-lg hover:shadow-teal-200/60 transition-all hover:-translate-y-0.5 active:scale-95">
                                <span className="text-2xl">🎯</span>
                                <p className="font-bold text-sm">Challenges</p>
                                <p className="text-teal-100 text-[10px]">{challenges.length} available</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
