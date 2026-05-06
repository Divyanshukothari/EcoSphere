import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Eye, EyeOff, Leaf } from 'lucide-react';

const AdminLogin = () => {
    const { login } = useAuth();
    const navigate  = useNavigate();
    const [email,    setEmail]    = useState('admin@ecosphere.com');
    const [password, setPassword] = useState('');
    const [showPw,   setShowPw]   = useState(false);
    const [error,    setError]    = useState('');
    const [loading,  setLoading]  = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user.role !== 'super_admin') {
                setError('Access denied. Super admin credentials required.');
                localStorage.removeItem('token');
                return;
            }
            navigate('/admin');
        } catch {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
            </div>
            <div className="relative w-full max-w-md">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/40">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50 mb-4">
                            <ShieldCheck size={28} className="text-white" />
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <Leaf size={14} className="text-emerald-400" />
                            <span className="text-slate-400 text-sm font-medium">EcoSphere</span>
                        </div>
                        <h1 className="text-white text-2xl font-bold">Admin Portal</h1>
                        <p className="text-slate-500 text-sm mt-1">Super administrator access only</p>
                    </div>
                    {error && (
                        <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-xs font-medium mb-1.5">Email address</label>
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                                placeholder="admin@ecosphere.com"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-60 mt-2 shadow-lg shadow-emerald-900/40"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <ShieldCheck size={16}/> Sign In as Admin
                                </span>
                            )}
                        </button>
                    </form>
                    <p className="text-center text-slate-600 text-xs mt-6">
                        Not an admin?{' '}
                        <a href="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors">Go to student login</a>
                    </p>
                </div>
                <p className="text-center text-slate-700 text-xs mt-6">EcoSphere Admin Panel · Restricted Access</p>
            </div>
        </div>
    );
};

export default AdminLogin;
