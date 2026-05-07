import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import BadgeList from '../components/BadgeList';
import { BookOpen, ChevronRight, ArrowLeft, Trophy, CheckCircle2 } from 'lucide-react';

const CourseDetail = () => {
    const { id } = useParams();

    const { data: course, isLoading } = useQuery({
        queryKey: ['course', id],
        queryFn: () => api.getCourse(id)
    });

    const { data: progress } = useQuery({
        queryKey: ['progress', id],
        queryFn: () => api.getProgress(id)
    });

    const { data: userBadges = [] } = useQuery({
        queryKey: ['userBadges'],
        queryFn: api.getUserBadges
    });

    const { data: courseBadges = [] } = useQuery({
        queryKey: ['courseBadges', id],
        queryFn: () => api.getCourseBadges(id)
    });

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const total = course?.lessons?.length || 0;
    const completed = progress?.completed_lessons || 0;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const earnedBadgeIds = new Set(userBadges.map(b => b.id));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
            <div className="max-w-5xl mx-auto px-6 py-10">
                <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>

                {/* Header */}
                <div className="glass-card p-8 mb-8">
                    <h1 className="font-display font-bold text-3xl text-slate-800 mb-2">{course?.title}</h1>
                    <p className="text-slate-500 text-sm mb-6">{course?.description}</p>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="font-bold text-xl text-slate-800">{total}</p>
                            <p className="text-xs text-slate-500">Lessons</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-xl text-brand-600">{completed}</p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                        {progress?.quiz_score > 0 && (
                            <div className="text-center">
                                <p className="font-bold text-xl text-emerald-600">{progress.quiz_score}%</p>
                                <p className="text-xs text-slate-500">Quiz Score</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-semibold text-brand-600">{pct}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-3">
                        <h2 className="font-display font-bold text-xl text-slate-800 flex items-center gap-2 mb-4">
                            <BookOpen size={18} className="text-brand-500" /> Lessons
                        </h2>
                        {course?.lessons?.map((lesson, i) => {
                            const isDone = i < completed;
                            return (
                                <Link key={lesson.id} to={`/courses/${id}/lessons/${lesson.id}`}>
                                    <div className="glass-card px-5 py-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDone ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {isDone ? <CheckCircle2 size={16} className="text-brand-500" /> : i + 1}
                                            </div>
                                            <span className={`font-medium text-sm ${isDone ? 'text-slate-700' : 'text-slate-700'}`}>{lesson.title}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-400" />
                                    </div>
                                </Link>
                            );
                        })}

                        {course?.quiz && (
                            <Link to={`/courses/${id}/quiz`}>
                                <div className="mt-4 glass-card px-5 py-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                            <Trophy size={16} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-slate-700">{course.quiz.title}</p>
                                            <p className="text-xs text-slate-500">{course.quiz.questions?.length || 0} questions</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400" />
                                </div>
                            </Link>
                        )}
                    </div>

                    <div>
                        <h2 className="font-display font-bold text-xl text-slate-800 mb-4">Badges</h2>
                        <div className="space-y-3">
                            {courseBadges.map(badge => {
                                const unlocked = earnedBadgeIds.has(badge.id);
                                return (
                                    <div key={badge.id} className={`rounded-xl border p-4 flex items-center gap-3 ${unlocked ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                                        <span className="text-2xl">{unlocked ? '🏅' : '🔒'}</span>
                                        <div>
                                            <p className={`font-semibold text-sm ${unlocked ? 'text-brand-700' : 'text-slate-600'}`}>{badge.title}</p>
                                            <p className="text-xs text-slate-500">{badge.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
