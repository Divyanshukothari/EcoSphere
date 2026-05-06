import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { showToast } from '../components/Toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const LessonPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: course, isLoading } = useQuery({
        queryKey: ['course', courseId],
        queryFn: () => api.getCourse(courseId)
    });

    const lesson = course?.lessons?.find(l => l.id === lessonId);
    const lessonIdx = course?.lessons?.findIndex(l => l.id === lessonId) ?? 0;
    const nextLesson = course?.lessons?.[lessonIdx + 1];

    const completeMutation = useMutation({
        mutationFn: () => api.completeLesson(courseId),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['progress', courseId]);
            queryClient.invalidateQueries(['userBadges']);
            if (data.unlocked_badges?.length > 0) {
                data.unlocked_badges.forEach(badge => {
                    showToast(`🏅 Badge Unlocked: ${badge.title}!`, 'badge');
                });
            } else {
                showToast('Lesson completed!', 'success');
            }
            if (nextLesson) {
                navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
            } else {
                navigate(`/courses/${courseId}`);
            }
        }
    });

    if (isLoading || !lesson) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
            <div className="max-w-3xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8">
                    <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft size={14} /> Back to Course
                    </Link>
                    <div className="text-xs text-slate-400 font-medium">
                        Lesson {lessonIdx + 1} of {course?.lessons?.length}
                    </div>
                </div>

                <div className="glass-card p-8 mb-6">
                    <div className="flex items-center gap-2 text-xs text-brand-600 font-semibold mb-3 uppercase tracking-wide">
                        <span>📖 Lesson {lessonIdx + 1}</span>
                    </div>
                    <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">{lesson.title}</h1>
                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                        {lesson.content}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        id="complete-lesson-btn"
                        onClick={() => completeMutation.mutate()}
                        disabled={completeMutation.isPending}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-700 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-brand-200/60 active:scale-95 transition-all disabled:opacity-60"
                    >
                        <CheckCircle size={18} />
                        {completeMutation.isPending ? 'Saving...' : nextLesson ? 'Complete & Next Lesson' : 'Complete Lesson'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LessonPage;
