import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
    Leaf, LogOut, Trophy, Star, BookOpen, Award,
    Medal, ChevronUp, ChevronDown, Minus, MessageCircle
} from 'lucide-react';

/* ─── Navbar ─────────────────────────────────────────────────────────────── */
const Navbar = () => {
    const { user, logout } = useAuth();
    return (
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-emerald-400 rounded-lg flex items-center justify-center">
                        <Leaf size={16} className="text-white" />
                    </div>
                    <span className="font-display font-bold text-slate-800 text-lg">EcoSphere</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/chat" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                        <MessageCircle size={15} /> EcoBot
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors">
                        <BookOpen size={15} /> Courses
                    </Link>
                    <span className="text-sm text-slate-500 hidden sm:block">👋 {user?.name}</span>
                    <button onClick={logout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors">
                        <LogOut size={15} /> Sign out
                    </button>
                </div>
            </div>
        </nav>
    );
};

/* ─── Medal helpers ──────────────────────────────────────────────────────── */
const PODIUM_CONFIG = [
    { rank: 1, emoji: '🥇', gradient: 'from-amber-400 to-yellow-300',   ring: 'ring-amber-400', height: 'h-28', label: '1st Place', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200' },
    { rank: 2, emoji: '🥈', gradient: 'from-slate-400 to-slate-300',    ring: 'ring-slate-400', height: 'h-20', label: '2nd Place', bg: 'from-slate-50 to-gray-50',   border: 'border-slate-200' },
    { rank: 3, emoji: '🥉', gradient: 'from-orange-400 to-amber-300',   ring: 'ring-orange-400', height: 'h-16', label: '3rd Place', bg: 'from-orange-50 to-amber-50', border: 'border-orange-200' },
];

const RankBadge = ({ rank }) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return (
        <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
            {rank}
        </span>
    );
};

const ScoreBar = ({ value, max, color }) => (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
            className={`h-full rounded-full ${color} transition-all duration-700`}
            style={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%` }}
        />
    </div>
);

/* ─── Podium Card ────────────────────────────────────────────────────────── */
const PodiumCard = ({ entry, config }) => {
    if (!entry) return <div />;
    return (
        <div className="flex flex-col items-center gap-2 px-2">
            {/* Avatar */}
            <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ${config.ring}`}>
                {entry.name.charAt(0).toUpperCase()}
                <span className="absolute -top-1 -right-1 text-base">{config.emoji}</span>
            </div>
            {/* Name */}
            <p className="font-semibold text-slate-800 text-sm text-center max-w-[90px] truncate">{entry.name}</p>
            <p className="text-xs text-slate-500">{entry.total_score.toFixed(0)} pts</p>
            {/* Podium block */}
            <div className={`w-24 ${config.height} bg-gradient-to-br ${config.gradient} rounded-t-xl flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-lg">{config.rank}</span>
            </div>
        </div>
    );
};

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const Leaderboard = () => {
    const { user } = useAuth();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: api.getLeaderboard,
        refetchInterval: 60_000, // auto-refresh every minute
    });

    const leaderboard = data?.leaderboard ?? [];
    const myRank = data?.myRank ?? null;
    const maxScore = leaderboard[0]?.total_score ?? 1;
    const top3 = [leaderboard[1], leaderboard[0], leaderboard[2]]; // silver, gold, bronze for visual podium

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

                {/* ── Header ── */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                        <Trophy size={12} /> Live Rankings
                    </div>
                    <h1 className="font-display font-bold text-4xl text-slate-800 mb-2">Leaderboard</h1>
                    <p className="text-slate-500 text-sm">Compete with fellow learners. Earn badges, ace quizzes, complete lessons!</p>
                </div>

                {/* ── Scoring guide ── */}
                <div className="mb-10 grid grid-cols-3 gap-4 text-center">
                    {[
                        { icon: '🏅', label: 'Badge', pts: '+20 pts', color: 'from-amber-50 to-yellow-50 border-amber-100' },
                        { icon: '📝', label: 'Quiz Avg %', pts: '+1 pt each %', color: 'from-blue-50 to-indigo-50 border-blue-100' },
                        { icon: '📖', label: 'Lesson', pts: '+5 pts', color: 'from-emerald-50 to-green-50 border-emerald-100' },
                    ].map(({ icon, label, pts, color }) => (
                        <div key={label} className={`glass-card p-4 bg-gradient-to-br ${color} border`}>
                            <p className="text-2xl mb-1">{icon}</p>
                            <p className="text-xs font-semibold text-slate-700">{label}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{pts}</p>
                        </div>
                    ))}
                </div>

                {/* ── Loading / Error ── */}
                {isLoading && (
                    <div className="space-y-3">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="glass-card p-4 animate-pulse flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-200" />
                                <div className="flex-1 h-4 bg-slate-200 rounded" />
                                <div className="w-16 h-4 bg-slate-100 rounded" />
                            </div>
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="text-center py-20 text-slate-400">
                        <p className="text-5xl mb-3">😕</p>
                        <p className="font-medium">Could not load leaderboard. Try again later.</p>
                    </div>
                )}

                {!isLoading && !isError && leaderboard.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <p className="text-5xl mb-3">🌱</p>
                        <p className="font-medium">No students yet. Be the first!</p>
                    </div>
                )}

                {/* ── Podium (top 3) ── */}
                {!isLoading && !isError && leaderboard.length >= 1 && (
                    <div className="glass-card mb-8 py-10 px-4 bg-gradient-to-br from-brand-600 to-emerald-500 border-0 shadow-2xl shadow-brand-300/40 relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                        <div className="absolute -bottom-12 -left-6 w-32 h-32 bg-white/5 rounded-full" />

                        <h2 className="text-center text-white/90 text-sm font-semibold mb-8 tracking-wider uppercase">🏆 Top Performers</h2>

                        {/* Podium arrangement: 2nd | 1st | 3rd */}
                        <div className="flex justify-center items-end gap-4 sm:gap-8">
                            {top3.map((entry, i) => {
                                const cfg = i === 0 ? PODIUM_CONFIG[1] : i === 1 ? PODIUM_CONFIG[0] : PODIUM_CONFIG[2];
                                return <PodiumCard key={cfg.rank} entry={entry} config={cfg} />;
                            })}
                        </div>
                    </div>
                )}

                {/* ── My Rank Banner ── */}
                {myRank && (
                    <div className="mb-6 glass-card p-4 bg-gradient-to-r from-brand-50 to-emerald-50 border border-brand-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                            {myRank.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-brand-600 font-semibold mb-0.5">Your Ranking</p>
                            <p className="font-display font-bold text-slate-800 truncate">{myRank.name}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-brand-600">#{myRank.rank}</p>
                            <p className="text-xs text-slate-500">{myRank.total_score.toFixed(0)} pts</p>
                        </div>
                    </div>
                )}

                {/* ── Full Rankings Table ── */}
                {!isLoading && !isError && leaderboard.length > 0 && (
                    <div className="glass-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-display font-bold text-slate-800 flex items-center gap-2">
                                <Medal size={18} className="text-brand-500" /> All Rankings
                            </h2>
                            <span className="text-xs text-slate-400">{leaderboard.length} students</span>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {leaderboard.map((entry) => {
                                const isMe = entry.id === user?.id;
                                return (
                                    <div
                                        key={entry.id}
                                        className={`px-6 py-4 flex items-center gap-4 transition-colors ${
                                            isMe
                                                ? 'bg-brand-50/60 hover:bg-brand-50'
                                                : 'hover:bg-slate-50/60'
                                        }`}
                                    >
                                        {/* Rank */}
                                        <div className="w-8 flex-shrink-0 flex justify-center">
                                            <RankBadge rank={entry.rank} />
                                        </div>

                                        {/* Avatar */}
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm ${
                                            entry.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-300' :
                                            entry.rank === 2 ? 'bg-gradient-to-br from-slate-400 to-slate-300' :
                                            entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-amber-300' :
                                            'bg-gradient-to-br from-brand-400 to-emerald-400'
                                        }`}>
                                            {entry.name.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Name & bars */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <p className={`font-semibold text-sm truncate ${isMe ? 'text-brand-700' : 'text-slate-800'}`}>
                                                    {entry.name}
                                                    {isMe && <span className="ml-1.5 text-[10px] bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full font-bold">YOU</span>}
                                                </p>
                                            </div>
                                            {/* Score bar */}
                                            <ScoreBar value={entry.total_score} max={maxScore} color="bg-gradient-to-r from-brand-400 to-emerald-400" />
                                        </div>

                                        {/* Stats */}
                                        <div className="hidden sm:flex items-center gap-4 flex-shrink-0 text-xs text-slate-500">
                                            <div className="flex items-center gap-1" title="Badges">
                                                <span>🏅</span>
                                                <span className="font-semibold text-slate-700">{entry.badge_count}</span>
                                            </div>
                                            <div className="flex items-center gap-1" title="Avg Quiz Score">
                                                <span>📝</span>
                                                <span className="font-semibold text-slate-700">{entry.avg_quiz_score.toFixed(0)}%</span>
                                            </div>
                                            <div className="flex items-center gap-1" title="Lessons completed">
                                                <span>📖</span>
                                                <span className="font-semibold text-slate-700">{entry.total_lessons}</span>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="flex-shrink-0 text-right min-w-[60px]">
                                            <p className={`text-base font-bold ${isMe ? 'text-brand-600' : 'text-slate-700'}`}>
                                                {entry.total_score.toFixed(0)}
                                            </p>
                                            <p className="text-[10px] text-slate-400">points</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Bottom spacer ── */}
                <div className="h-10" />
            </main>
        </div>
    );
};

export default Leaderboard;
