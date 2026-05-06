import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const AddLesson = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const { data: course } = useQuery({
        queryKey: ['course', courseId],
        queryFn: () => api.getCourse(courseId)
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const orderIdx = (course?.lessons?.length || 0) + 1;
            const res = await fetch(`http://localhost:5000/api/courses/${courseId}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ title, content, order_index: orderIdx })
            });
            if (!res.ok) throw new Error();
            queryClient.invalidateQueries(['course', courseId]);
            setTitle('');
            setContent('');
        } catch {
            setError('Failed to add lesson. Try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/20 px-6 py-10">
            <div className="max-w-3xl mx-auto">
                <Link to="/teacher" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-8 transition-colors">
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>

                <h1 className="font-display font-bold text-2xl text-slate-800 mb-2">Add Lesson</h1>
                <p className="text-slate-500 text-sm mb-6">Course: <span className="font-medium text-slate-700">{course?.title}</span></p>

                {/* Existing lessons */}
                {course?.lessons?.length > 0 && (
                    <div className="glass-card p-5 mb-6">
                        <p className="font-medium text-sm text-slate-700 mb-3">Existing Lessons ({course.lessons.length})</p>
                        <div className="space-y-2">
                            {course.lessons.map((l, i) => (
                                <div key={l.id} className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="w-5 h-5 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                                    <span>{l.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="glass-card p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Plus size={18} className="text-violet-500" />
                        <h2 className="font-semibold text-slate-800">New Lesson</h2>
                    </div>
                    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Lesson Title</label>
                            <input
                                id="lesson-title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                placeholder="e.g. What is Climate Change?"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Lesson Content</label>
                            <textarea
                                id="lesson-content"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={8}
                                required
                                placeholder="Write the full lesson content here..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm resize-none"
                            />
                        </div>
                        <button
                            id="add-lesson-btn"
                            type="submit"
                            disabled={saving}
                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-60"
                        >
                            {saving ? 'Adding...' : 'Add Lesson'}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-4">
                    <Link to="/teacher" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                        Done adding lessons? → Return to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AddLesson;
