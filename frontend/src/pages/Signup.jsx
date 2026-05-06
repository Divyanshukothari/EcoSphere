import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, User, GraduationCap, BookOpenCheck } from 'lucide-react';

const Signup = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await register(form.name, form.email, form.password, form.role);
            navigate(user.role === 'teacher' ? '/teacher' : '/dashboard');
        } catch (err) {
            setError('Registration failed. Email may already be in use.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 p-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg">
                        <Leaf size={20} className="text-white" />
                    </div>
                    <span className="font-display font-bold text-2xl text-white">EcoSphere</span>
                </div>

                <div className="glass-card bg-white/10 border-white/10 p-8">
                    <h1 className="font-display font-bold text-2xl text-white mb-1">Create account</h1>
                    <p className="text-slate-400 text-sm mb-6">Start your eco-learning journey</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-300 mb-1.5">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="signup-name"
                                    type="text"
                                    value={form.name}
                                    onChange={e => update('name', e.target.value)}
                                    required
                                    placeholder="Jane Doe"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-300 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="signup-email"
                                    type="email"
                                    value={form.email}
                                    onChange={e => update('email', e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="signup-password"
                                    type="password"
                                    value={form.password}
                                    onChange={e => update('password', e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-300 mb-2">I am a...</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { val: 'student', label: 'Student', Icon: GraduationCap },
                                    { val: 'teacher', label: 'Teacher', Icon: BookOpenCheck },
                                ].map(({ val, label, Icon }) => (
                                    <button
                                        key={val}
                                        type="button"
                                        id={`role-${val}`}
                                        onClick={() => update('role', val)}
                                        className={`flex items-center gap-2 py-3 px-4 rounded-xl border font-medium text-sm transition-all ${
                                            form.role === val
                                                ? 'bg-brand-600/30 border-brand-500 text-brand-300'
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'
                                        }`}
                                    >
                                        <Icon size={16} />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            id="signup-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-700 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-900/40 active:scale-95 disabled:opacity-60 mt-2"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 text-sm mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
