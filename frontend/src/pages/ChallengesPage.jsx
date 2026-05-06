import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Leaf, LogOut, Trophy, BookOpen, Target, ExternalLink, CheckCircle, Clock, XCircle, Send } from 'lucide-react';

const DIFF = {
    easy:   { label:'Easy',   color:'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    medium: { label:'Medium', color:'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    hard:   { label:'Hard',   color:'bg-red-500/20 text-red-400 border-red-500/30' },
};
const STATUS_ICON = { pending: <Clock size={14}/>, approved: <CheckCircle size={14}/>, rejected: <XCircle size={14}/> };
const STATUS_COLOR = { pending:'text-amber-400 bg-amber-500/10 border-amber-500/20', approved:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', rejected:'text-red-400 bg-red-500/10 border-red-500/20' };

const Navbar = () => {
    const { user, logout } = useAuth();
    return (
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-emerald-400 rounded-lg flex items-center justify-center">
                        <Leaf size={16} className="text-white"/>
                    </div>
                    <span className="font-display font-bold text-slate-800 text-lg">EcoSphere</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors"><BookOpen size={15}/> Courses</Link>
                    <Link to="/leaderboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-500 transition-colors"><Trophy size={15}/> Leaderboard</Link>
                    <span className="text-sm text-slate-500 hidden sm:block">👋 {user?.name}</span>
                    <button onClick={logout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors"><LogOut size={15}/> Sign out</button>
                </div>
            </div>
        </nav>
    );
};

const ChallengeCard = ({ challenge, onSubmit }) => {
    const status = challenge.submission_status;
    const diff = DIFF[challenge.difficulty] || DIFF.medium;

    return (
        <div className={`glass-card p-5 flex flex-col gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${!status ? '' : ''}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex gap-1.5 flex-wrap mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diff.color}`}>{diff.label}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200">{challenge.category}</span>
                    </div>
                    <h3 className="font-display font-bold text-slate-800 text-base leading-snug">{challenge.title}</h3>
                </div>
                <div className="flex-shrink-0 text-right">
                    <p className="text-xl font-bold text-brand-600">{challenge.points}</p>
                    <p className="text-[10px] text-slate-400">points</p>
                </div>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed flex-1">{challenge.description}</p>

            {challenge.deadline && (
                <p className="text-xs text-slate-400">📅 Deadline: {new Date(challenge.deadline).toLocaleDateString()}</p>
            )}

            <div className="mt-auto pt-1">
                {status ? (
                    <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border ${STATUS_COLOR[status]}`}>
                        {STATUS_ICON[status]}
                        <span className="capitalize">{status}</span>
                        {challenge.submission_note && (
                            <span className="ml-1 text-slate-500 font-normal truncate">— {challenge.submission_note}</span>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => onSubmit(challenge)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-95 shadow-sm shadow-brand-500/20"
                    >
                        <Send size={14}/> Submit Proof
                    </button>
                )}
                {status === 'rejected' && (
                    <button
                        onClick={() => onSubmit(challenge)}
                        className="w-full mt-2 text-xs text-slate-400 hover:text-brand-600 transition-colors"
                    >
                        Re-submit proof
                    </button>
                )}
            </div>
        </div>
    );
};

export default function ChallengesPage() {
    const qc = useQueryClient();
    const [submitModal, setSubmitModal] = useState(null);
    const [desc, setDesc] = useState('');
    const [url, setUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const { data: challenges = [], isLoading } = useQuery({ queryKey: ['challenges'], queryFn: api.getChallenges });

    const openModal = (challenge) => { setSubmitModal(challenge); setDesc(''); setUrl(''); setSubmitError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitting(true);
        try {
            await api.submitChallenge(submitModal.id, desc, url);
            qc.invalidateQueries(['challenges']);
            setSubmitModal(null);
        } catch (err) {
            setSubmitError(err.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const approved = challenges.filter(c => c.submission_status === 'approved').length;
    const pending  = challenges.filter(c => c.submission_status === 'pending').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

                {/* Header */}
                <div className="mb-8 bg-gradient-to-r from-brand-600 to-emerald-500 rounded-3xl p-8 text-white shadow-xl shadow-brand-200/60 relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full"/>
                    <div className="absolute right-16 -bottom-12 w-32 h-32 bg-white/5 rounded-full"/>
                    <p className="text-brand-100 text-sm font-medium mb-1 flex items-center gap-2"><Target size={14}/> Real-world Challenges</p>
                    <h1 className="font-display font-bold text-3xl mb-2">Eco Challenges</h1>
                    <p className="text-brand-100 text-sm">Take action, submit proof, earn points on the leaderboard!</p>
                    <div className="mt-6 flex gap-4">
                        <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
                            <p className="text-2xl font-bold">{challenges.length}</p>
                            <p className="text-xs text-brand-100">Available</p>
                        </div>
                        <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
                            <p className="text-2xl font-bold">{approved}</p>
                            <p className="text-xs text-brand-100">Completed</p>
                        </div>
                        <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
                            <p className="text-2xl font-bold">{pending}</p>
                            <p className="text-xs text-brand-100">Pending</p>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="glass-card p-5 animate-pulse">
                                <div className="h-4 bg-slate-200 rounded mb-3 w-1/2"/>
                                <div className="h-5 bg-slate-200 rounded mb-2"/>
                                <div className="h-3 bg-slate-100 rounded mb-1"/>
                                <div className="h-3 bg-slate-100 rounded w-3/4"/>
                            </div>
                        ))}
                    </div>
                ) : challenges.length === 0 ? (
                    <div className="text-center py-24 text-slate-400">
                        <p className="text-5xl mb-4">🌱</p>
                        <p className="text-lg font-medium">No challenges yet</p>
                        <p className="text-sm mt-1">Check back soon — your admin will add some!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {challenges.map(c => <ChallengeCard key={c.id} challenge={c} onSubmit={openModal}/>)}
                    </div>
                )}
            </main>

            {/* Submit Modal */}
            {submitModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100">
                        <h3 className="font-display font-bold text-slate-800 text-xl mb-1">{submitModal.title}</h3>
                        <p className="text-slate-500 text-sm mb-5">{submitModal.description}</p>

                        {submitError && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{submitError}</div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-slate-600 text-xs font-semibold mb-1.5">What did you do? <span className="text-red-400">*</span></label>
                                <textarea
                                    required minLength={10} value={desc} onChange={e => setDesc(e.target.value)} rows={4}
                                    placeholder="Describe what you did to complete this challenge in detail…"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Proof link <span className="text-slate-400 font-normal">(optional — photo, video, etc.)</span></label>
                                <div className="relative">
                                    <ExternalLink size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                                    <input
                                        type="url" value={url} onChange={e => setUrl(e.target.value)}
                                        placeholder="https://photos.google.com/…"
                                        className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setSubmitModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 text-sm transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-60 shadow-sm">
                                    {submitting ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Submitting…</> : <><Send size={14}/> Submit for Review</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
