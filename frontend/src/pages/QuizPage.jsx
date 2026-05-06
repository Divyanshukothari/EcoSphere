import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { showToast } from '../components/Toast';
import { ArrowLeft, CheckCircle2, Trophy } from 'lucide-react';

const QuizPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    const { data: course, isLoading } = useQuery({
        queryKey: ['course', courseId],
        queryFn: () => api.getCourse(courseId)
    });

    const quiz = course?.quiz;

    const submitMutation = useMutation({
        mutationFn: () => api.submitQuiz(courseId, quiz.id, answers),
        onSuccess: (data) => {
            setResult(data);
            setSubmitted(true);
            queryClient.invalidateQueries(['progress', courseId]);
            queryClient.invalidateQueries(['userBadges']);
            if (data.unlocked_badges?.length > 0) {
                data.unlocked_badges.forEach(badge => {
                    showToast(`🏅 Badge Unlocked: ${badge.title}!`, 'badge');
                });
            }
        }
    });

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!quiz) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-500">
            <p className="text-4xl">📝</p>
            <p>No quiz available for this course.</p>
            <Link to={`/courses/${courseId}`} className="text-brand-600 text-sm hover:underline">← Back to course</Link>
        </div>
    );

    const allAnswered = quiz.questions?.every(q => answers[q.id]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
            <div className="max-w-3xl mx-auto px-6 py-10">
                <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                    <ArrowLeft size={14} /> Back to Course
                </Link>

                <div className="glass-card p-8 mb-6">
                    <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm mb-2">
                        <Trophy size={16} /> Quiz
                    </div>
                    <h1 className="font-display font-bold text-2xl text-slate-800">{quiz.title}</h1>
                    <p className="text-slate-500 text-sm mt-1">{quiz.questions?.length} questions</p>
                </div>

                {submitted && result ? (
                    <div className="glass-card p-10 text-center animate-pop-in">
                        <div className="text-6xl mb-4">{result.score >= 80 ? '🏆' : result.score >= 50 ? '👍' : '💪'}</div>
                        <h2 className="font-display font-bold text-3xl text-slate-800 mb-2">
                            You scored {result.score}%
                        </h2>
                        <p className="text-slate-500 text-sm mb-6">
                            {result.score >= 80 ? 'Outstanding work! 🌟' : result.score >= 50 ? 'Good effort! Keep learning.' : 'Keep practicing — you\'ll get there!'}
                        </p>
                        {result.unlocked_badges?.length > 0 && (
                            <div className="mb-6 p-4 bg-brand-50 rounded-xl border border-brand-100">
                                <p className="text-brand-700 font-semibold text-sm mb-2">🏅 New badges earned!</p>
                                {result.unlocked_badges.map(b => (
                                    <p key={b.id} className="text-brand-600 text-sm">{b.title}</p>
                                ))}
                            </div>
                        )}
                        <Link to={`/courses/${courseId}`} className="btn-primary inline-flex items-center gap-2">
                            <CheckCircle2 size={16} /> Back to Course
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {quiz.questions?.map((q, qIdx) => (
                            <div key={q.id} className="glass-card p-6">
                                <p className="font-semibold text-slate-800 mb-4">
                                    <span className="text-brand-500 font-bold">Q{qIdx + 1}.</span> {q.question_text}
                                </p>
                                <div className="space-y-2.5">
                                    {q.options?.map(opt => (
                                        <label
                                            key={opt.id}
                                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                                answers[q.id] === opt.id
                                                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                                                    : 'border-slate-200 hover:border-brand-200 hover:bg-brand-50/50 text-slate-700'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${q.id}`}
                                                value={opt.id}
                                                checked={answers[q.id] === opt.id}
                                                onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                                                className="accent-brand-600"
                                            />
                                            <span className="text-sm">{opt.option_text}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end">
                            <button
                                id="submit-quiz-btn"
                                onClick={() => submitMutation.mutate()}
                                disabled={!allAnswered || submitMutation.isPending}
                                className="px-8 py-3 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-700 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-brand-200/60 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {submitMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
