import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-green-950 to-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading EcoSphere...</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    // Support both a single role string or an array of roles
    if (role) {
        const allowed = Array.isArray(role) ? role : [role];
        if (!allowed.includes(user.role)) {
            if (user.role === 'super_admin') return <Navigate to="/admin" replace />;
            if (user.role === 'teacher')     return <Navigate to="/teacher" replace />;
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
