import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ArrowLeft, Plus, Award } from 'lucide-react';

const BADGE_PRESETS = [
    { title: 'Starter', description: 'Complete your first lesson', condition_type: 'LESSONS', condition_value: 1, emoji: '🌱' },
    { title: 'Learner', description: 'Complete 50% of lessons', condition_type: 'LESSONS', condition_value: null, emoji: '📗' },
    { title: 'Master', description: 'Complete all lessons', condition_type: 'LESSONS', condition_value: null, emoji: '🎓' },
    { title: 'Quiz Pro', description: 'Score above 80% on the quiz', condition_type: 'QUIZ', condition_value: 80, emoji: '🏆' },
];

const AddBadges = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', description: '', condition_type: 'LESSONS', condition_value: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saving, setSaving] = useState(false);

    const { data: course } = useQuery({
        queryKey: ['course', courseId],
        queryFn: () => api.getCourse(courseId)
    });

    const applyPreset = (preset) => {
        const lessonTotal = course?.lessons?.length || 0;
        let val = preset.condition_value;
        if (preset.title === 'Learner') val = Math.ceil(lessonTotal / 2);
        if (preset.title === 'Master') val = lessonTotal;
        setForm({ title: preset.title, description: preset.description, condition_type: preset.condition_type, condition_value: val || '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setSaving(true);
        try {
            await api.createBadge({ course_id: courseId, ...form, condition_value: parseInt(form.condition_value) });
            setSuccess(`Badge "${form.title}" created! Add another or return to dashboard.`);
            setForm({ title: '', description: '', condition_type: 'LESSONS', condition_value: '' });
        } catch (err) {
            setError(err.message || 'Failed to create badge. Try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50/20 px-6 py-10">
            <div className="max-w-2xl mx-auto">
                <Link to="/teacher" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-8 transition-colors">
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>
                <h1 className="font-display font-bold text-2xl text-slate-800 mb-2">Add Badges</h1>
                <p className="text-slate-500 text-sm mb-6">Course: <span className="font-medium text-slate-700">{course?.title}</span></p>

                {/* Presets */}
                <div className="glass-card p-6 mb-6">
                    <p className="font-semibold text-sm text-slate-700 mb-3">Quick Presets</p>
                    <div className="grid grid-cols-2 gap-3">
                        {BADGE_PRESETS.map(preset => (
                            <button
                                key={preset.title}
                                type="button"
                                onClick={() => applyPreset(preset)}
                                className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-xl text-left transition-all"
                            >
                                <span className="text-xl">{preset.emoji}</span>
                                <div>
                                    <p className="font-semibold text-xs text-slate-800">{preset.title}</p>
                                    <p className="text-[10px] text-slate-500">{preset.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
                {success && <div className="bg-brand-50 border border-brand-200 text-brand-700 text-sm px-4 py-3 rounded-xl mb-4">✅ {success}</div>}

                <div className="glass-card p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Award size={18} className="text-brand-500" />
                        <h2 className="font-semibold text-slate-800">Badge Details</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Badge Title</label>
                            <input type="text" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required placeholder="e.g. Starter"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                            <input type="text" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} required placeholder="What this badge is for"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Condition Type</label>
                                <select value={form.condition_type} onChange={e => setForm(f => ({...f, condition_type: e.target.value}))}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm">
                                    <option value="LESSONS">Lessons Completed</option>
                                    <option value="QUIZ">Quiz Score %</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    {form.condition_type === 'LESSONS' ? 'Lessons Required' : 'Min Score (%)'}
                                </label>
                                <input type="number" value={form.condition_value} onChange={e => setForm(f => ({...f, condition_value: e.target.value}))} required min={1}
                                    placeholder={form.condition_type === 'LESSONS' ? '1' : '80'}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm" />
                            </div>
                        </div>
                        <button id="add-badge-btn" type="submit" disabled={saving}
                            className="w-full py-3 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-700 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-60">
                            {saving ? 'Creating...' : '🏅 Create Badge'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBadges;
