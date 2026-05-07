import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { ArrowLeft, BookOpen } from 'lucide-react';

const CreateCourse = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.createCourse({ title, description });
            queryClient.invalidateQueries(['courses']);
            navigate('/teacher');
        } catch (err) {
            setError(err.message || 'Failed to create course. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/20 px-6 py-10">
            <div className="max-w-2xl mx-auto">
                <Link to="/teacher" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-8 transition-colors">
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>
                <div className="glass-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <BookOpen size={18} className="text-white" />
                        </div>
                        <h1 className="font-display font-bold text-2xl text-slate-800">Create New Course</h1>
                    </div>
                    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Title</label>
                            <input
                                id="course-title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                placeholder="e.g. Introduction to Climate Change"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                            <textarea
                                id="course-description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                placeholder="Describe what students will learn..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm resize-none"
                            />
                        </div>
                        <button
                            id="create-course-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating…' : 'Create Course'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
