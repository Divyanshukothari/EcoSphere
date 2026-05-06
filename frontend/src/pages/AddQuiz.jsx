import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ArrowLeft, Plus, Trash2, HelpCircle } from 'lucide-react';

const AddQuiz = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([
        { text: '', options: [{ text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }] }
    ]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const { data: course } = useQuery({
        queryKey: ['course', courseId],
        queryFn: () => api.getCourse(courseId)
    });

    const addQuestion = () => {
        setQuestions(prev => [...prev, {
            text: '',
            options: [{ text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }]
        }]);
    };

    const updateQuestion = (qi, text) => {
        setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, text } : q));
    };

    const updateOption = (qi, oi, field, value) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qi) return q;
            const opts = q.options.map((o, j) => {
                if (field === 'is_correct') return { ...o, is_correct: j === oi };
                return j === oi ? { ...o, [field]: value } : o;
            });
            return { ...q, options: opts };
        }));
    };

    const removeQuestion = (qi) => setQuestions(prev => prev.filter((_, i) => i !== qi));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        for (const q of questions) {
            if (!q.options.some(o => o.is_correct)) {
                setError('Each question must have one correct answer.');
                return;
            }
        }
        setSaving(true);
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${courseId}/quizzes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ title: quizTitle, questions: questions.map(q => ({ text: q.text, options: q.options })) })
            });
            if (!res.ok) throw new Error();
            navigate('/teacher');
        } catch {
            setError('Failed to create quiz. Try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20 px-6 py-10">
            <div className="max-w-3xl mx-auto">
                <Link to="/teacher" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-8 transition-colors">
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>
                <h1 className="font-display font-bold text-2xl text-slate-800 mb-2">Create Quiz</h1>
                <p className="text-slate-500 text-sm mb-6">Course: <span className="font-medium text-slate-700">{course?.title}</span></p>

                {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="glass-card p-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Quiz Title</label>
                        <input
                            id="quiz-title"
                            type="text"
                            value={quizTitle}
                            onChange={e => setQuizTitle(e.target.value)}
                            required
                            placeholder="e.g. Climate Change Fundamentals Quiz"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                        />
                    </div>

                    {questions.map((q, qi) => (
                        <div key={qi} className="glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <HelpCircle size={16} className="text-amber-500" />
                                    <span className="font-semibold text-slate-800 text-sm">Question {qi + 1}</span>
                                </div>
                                {questions.length > 1 && (
                                    <button type="button" onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600 transition-colors">
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={q.text}
                                onChange={e => updateQuestion(qi, e.target.value)}
                                required
                                placeholder="Enter question..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm mb-4"
                            />
                            <div className="space-y-2.5">
                                <p className="text-xs text-slate-500 font-medium">Options (select the correct answer)</p>
                                {q.options.map((opt, oi) => (
                                    <div key={oi} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${opt.is_correct ? 'border-brand-400 bg-brand-50' : 'border-slate-200'}`}>
                                        <input
                                            type="radio"
                                            name={`correct-${qi}`}
                                            checked={opt.is_correct}
                                            onChange={() => updateOption(qi, oi, 'is_correct', true)}
                                            className="accent-brand-600"
                                        />
                                        <input
                                            type="text"
                                            value={opt.text}
                                            onChange={e => updateOption(qi, oi, 'text', e.target.value)}
                                            required
                                            placeholder={`Option ${oi + 1}`}
                                            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                                        />
                                        {opt.is_correct && <span className="text-xs text-brand-600 font-semibold">✓ Correct</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 hover:border-amber-400 hover:text-amber-600 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Add Another Question
                    </button>

                    <button
                        id="create-quiz-btn"
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-60"
                    >
                        {saving ? 'Creating Quiz...' : 'Create Quiz'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddQuiz;
