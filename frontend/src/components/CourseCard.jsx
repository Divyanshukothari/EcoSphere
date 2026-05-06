import { Link } from 'react-router-dom';
import { BookOpen, Users, ArrowRight } from 'lucide-react';

const CourseCard = ({ course, progress }) => {
    const total = course.total_lessons || 0;
    const completed = progress?.completed_lessons || 0;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <Link to={`/courses/${course.id}`} className="group block">
            <div className="glass-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                        <BookOpen size={22} />
                    </div>
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-display font-700 text-slate-800 text-lg leading-tight mb-1">{course.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>

                <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                    <Users size={12} />
                    <span>{course.instructor_name || 'Instructor'}</span>
                </div>

                {progress !== undefined && (
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">{completed}/{total} lessons</span>
                            <span className="font-semibold text-brand-600">{pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default CourseCard;
