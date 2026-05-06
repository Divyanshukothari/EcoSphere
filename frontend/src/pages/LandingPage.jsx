import { Link } from 'react-router-dom';
import { Leaf, BookOpen, Award, ClipboardList, ChevronRight, Check, Star, Users, Zap, Shield, Globe } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#020c06] text-white overflow-x-hidden font-sans">

            {/* ─── Navbar ─── */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-[#020c06]/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                        <Leaf size={18} className="text-white" />
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight">EcoSphere</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
                    <a href="#badges" className="hover:text-white transition-colors">Badges</a>
                    <a href="#for-who" className="hover:text-white transition-colors">For Who</a>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2">Sign In</Link>
                    <Link to="/signup" className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/40 active:scale-95">
                        Get Started Free
                    </Link>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
                {/* Glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
                        <Zap size={12} />
                        Gamified Environmental Education Platform
                    </div>

                    <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
                        Learn. Grow.{' '}
                        <span className="relative">
                            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                                Save the Planet.
                            </span>
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
                        EcoSphere makes environmental education engaging through interactive courses, quizzes, and a badge system that rewards every step of your eco-learning journey.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup" className="group flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-900/40 transition-all active:scale-95 text-base">
                            Start Learning for Free
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/login" className="flex items-center gap-2 border border-white/10 hover:border-white/30 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-2xl transition-all text-base backdrop-blur-sm">
                            I'm a Teacher →
                        </Link>
                    </div>

                    {/* Social proof */}
                    <div className="flex items-center justify-center gap-6 mt-12 text-slate-500 text-sm">
                        <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-1.5">
                                {['🧑', '👩', '👨', '🧒'].map((e, i) => (
                                    <div key={i} className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">{e}</div>
                                ))}
                            </div>
                            <span>Join 1,000+ learners</span>
                        </div>
                        <div className="w-px h-4 bg-slate-700" />
                        <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={13} className="text-amber-400 fill-amber-400" />)}
                            <span className="ml-1">4.9 / 5</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard preview mockup */}
                <div className="relative z-10 mt-20 max-w-5xl mx-auto w-full">
                    <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-slate-900">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="bg-slate-800 px-4 py-1 rounded-lg text-xs text-slate-500">ecosphere.app/dashboard</div>
                            </div>
                        </div>
                        {/* Mock dashboard content */}
                        <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950">
                            {/* Mock header */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg" />
                                    <span className="text-white font-bold text-sm">EcoSphere</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-20 h-7 bg-slate-800 rounded-lg animate-pulse" />
                                    <div className="w-8 h-7 bg-slate-800 rounded-lg" />
                                </div>
                            </div>
                            {/* Mock hero banner */}
                            <div className="bg-gradient-to-r from-emerald-700 to-green-600 rounded-2xl p-5 mb-5 relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <p className="text-emerald-200 text-xs mb-1">Welcome back 🌿</p>
                                <div className="w-32 h-4 bg-white/20 rounded mb-3" />
                                <div className="flex gap-2">
                                    <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
                                        <p className="text-white font-bold text-lg">4</p>
                                        <p className="text-[10px] text-emerald-200">Courses</p>
                                    </div>
                                    <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
                                        <p className="text-white font-bold text-lg">7</p>
                                        <p className="text-[10px] text-emerald-200">Badges</p>
                                    </div>
                                </div>
                            </div>
                            {/* Mock course cards */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { title: 'Climate Change 101', color: 'from-emerald-600 to-teal-600', pct: 80 },
                                    { title: 'Ocean Ecosystems', color: 'from-blue-600 to-cyan-600', pct: 50 },
                                    { title: 'Renewable Energy', color: 'from-amber-600 to-orange-500', pct: 30 },
                                ].map((c, i) => (
                                    <div key={i} className="bg-slate-800/60 rounded-xl p-4 border border-white/5">
                                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} mb-3 flex items-center justify-center`}>
                                            <BookOpen size={14} className="text-white" />
                                        </div>
                                        <p className="text-white text-xs font-semibold mb-2">{c.title}</p>
                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div className={`h-full bg-gradient-to-r ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                                        </div>
                                        <p className="text-slate-500 text-[10px] mt-1">{c.pct}% complete</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Glow under mockup */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-emerald-600/20 blur-3xl rounded-full" />
                </div>
            </section>

            {/* ─── Stats Bar ─── */}
            <section className="relative border-y border-white/5 bg-white/[0.02] py-10">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { val: '50+', label: 'Courses Available', icon: BookOpen },
                        { val: '1K+', label: 'Active Learners', icon: Users },
                        { val: '20+', label: 'Unique Badges', icon: Award },
                        { val: '98%', label: 'Completion Rate', icon: Shield },
                    ].map(({ val, label, icon: Icon }) => (
                        <div key={label} className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-700/30 flex items-center justify-center mb-1">
                                <Icon size={16} className="text-emerald-400" />
                            </div>
                            <p className="font-display font-bold text-3xl text-white">{val}</p>
                            <p className="text-slate-500 text-sm">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Features ─── */}
            <section id="features" className="py-28 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">Features</span>
                    <h2 className="font-display font-bold text-4xl md:text-5xl mt-3 mb-4">Everything you need to<br />learn & teach ecology</h2>
                    <p className="text-slate-500 max-w-xl mx-auto text-lg">A complete platform designed to make environmental education interactive and rewarding.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: BookOpen,
                            color: 'from-emerald-500 to-green-400',
                            glow: 'shadow-emerald-900/50',
                            title: 'Structured Learning Hub',
                            desc: 'Browse courses built by expert environmental educators. Each course is organized into focused lessons for optimal learning retention.',
                            bullets: ['Lesson-by-lesson structure', 'Rich text content', 'Self-paced learning']
                        },
                        {
                            icon: ClipboardList,
                            color: 'from-blue-500 to-cyan-400',
                            glow: 'shadow-blue-900/50',
                            title: 'Interactive Quiz System',
                            desc: 'Test your knowledge with MCQ quizzes at the end of every course. Instant feedback on your performance with score tracking.',
                            bullets: ['Multiple choice questions', 'Real-time scoring', 'Quiz history tracking']
                        },
                        {
                            icon: Award,
                            color: 'from-amber-500 to-orange-400',
                            glow: 'shadow-amber-900/50',
                            title: 'Badge & Achievement System',
                            desc: 'Earn badges as you progress. Each badge is automatically unlocked when you hit a milestone — no manual tracking needed.',
                            bullets: ['Auto-unlocking badges', 'Toast notifications', 'Locked vs earned views']
                        },
                    ].map(({ icon: Icon, color, glow, title, desc, bullets }) => (
                        <div key={title} className="group relative bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-300">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} shadow-xl ${glow} flex items-center justify-center mb-5`}>
                                <Icon size={22} className="text-white" />
                            </div>
                            <h3 className="font-display font-bold text-xl mb-3 text-white">{title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-5">{desc}</p>
                            <ul className="space-y-2">
                                {bullets.map(b => (
                                    <li key={b} className="flex items-center gap-2 text-sm text-slate-400">
                                        <Check size={14} className="text-emerald-500 flex-shrink-0" />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── How It Works ─── */}
            <section id="how-it-works" className="py-24 relative border-t border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">How It Works</span>
                        <h2 className="font-display font-bold text-4xl md:text-5xl mt-3">Simple.&nbsp;Powerful.&nbsp;Effective.</h2>
                    </div>
                    <div className="relative">
                        {/* Line */}
                        <div className="absolute top-8 left-[calc(16.66%)] right-[calc(16.66%)] h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent hidden md:block" />
                        <div className="grid md:grid-cols-3 gap-10">
                            {[
                                { step: '01', icon: '🔐', title: 'Create Account', desc: 'Sign up as a student or teacher in seconds — no credit card required.' },
                                { step: '02', icon: '📖', title: 'Choose a Course', desc: 'Browse rich, structured courses on climate, ecosystems, energy, and more.' },
                                { step: '03', icon: '🏅', title: 'Earn Your Badges', desc: 'Complete lessons and ace quizzes to unlock badges and track your growth.' },
                            ].map(({ step, icon, title, desc }) => (
                                <div key={step} className="flex flex-col items-center text-center">
                                    <div className="relative mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-emerald-700/40 flex items-center justify-center text-3xl shadow-xl shadow-black/40">
                                            {icon}
                                        </div>
                                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{step}</span>
                                    </div>
                                    <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Badges Showcase ─── */}
            <section id="badges" className="py-24 px-6 max-w-5xl mx-auto">
                <div className="text-center mb-14">
                    <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">Gamification</span>
                    <h2 className="font-display font-bold text-4xl md:text-5xl mt-3 mb-4">Collect every badge.<br />Own your journey.</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">Every course has its own set of badges. Progress through lessons and nail quizzes to unlock them all.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {[
                        { emoji: '🌱', name: 'Starter', desc: 'Complete your first lesson', unlocked: true, color: 'from-emerald-600 to-green-500' },
                        { emoji: '📗', name: 'Learner', desc: 'Finish 50% of a course', unlocked: true, color: 'from-blue-600 to-cyan-500' },
                        { emoji: '🎓', name: 'Master', desc: 'Complete all lessons', unlocked: false, color: 'from-violet-600 to-purple-500' },
                        { emoji: '🏆', name: 'Quiz Pro', desc: 'Score above 80% on a quiz', unlocked: false, color: 'from-amber-500 to-orange-500' },
                    ].map(({ emoji, name, desc, unlocked, color }) => (
                        <div key={name} className={`rounded-3xl border p-6 flex flex-col items-center gap-3 text-center transition-all group ${
                            unlocked
                                ? 'bg-white/[0.04] border-white/15 hover:border-emerald-500/40 hover:bg-white/[0.07]'
                                : 'bg-white/[0.02] border-white/5 opacity-50 grayscale'
                        }`}>
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${unlocked ? `bg-gradient-to-br ${color} shadow-xl` : 'bg-slate-800'}`}>
                                {unlocked ? emoji : '🔒'}
                            </div>
                            <div>
                                <p className={`font-display font-bold text-sm ${unlocked ? 'text-white' : 'text-slate-500'}`}>{name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                            </div>
                            {unlocked && (
                                <span className="text-xs bg-emerald-900/50 text-emerald-400 border border-emerald-700/30 px-2 py-1 rounded-full font-medium">
                                    Earned ✓
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── For Students & Teachers ─── */}
            <section id="for-who" className="py-24 border-t border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-950/10 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-14">
                        <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">Built For Everyone</span>
                        <h2 className="font-display font-bold text-4xl md:text-5xl mt-3">For students. For teachers.</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Student */}
                        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-700/20 rounded-3xl p-8">
                            <div className="text-4xl mb-4">🎓</div>
                            <h3 className="font-display font-bold text-2xl text-white mb-3">For Students</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">Explore a growing library of environmental courses at your own pace and track every step of your progress.</p>
                            <ul className="space-y-3">
                                {[
                                    'Browse & enroll in any course',
                                    'Read structured lessons anytime',
                                    'Attempt MCQ quizzes and get instant scores',
                                    'Earn badges automatically on milestones',
                                    'Track progress per course with visual indicators',
                                ].map(i => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                                        <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" /> {i}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/signup" className="mt-8 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
                                Join as Student <ChevronRight size={15} />
                            </Link>
                        </div>
                        {/* Teacher */}
                        <div className="bg-gradient-to-br from-violet-950/60 to-slate-900 border border-violet-700/20 rounded-3xl p-8">
                            <div className="text-4xl mb-4">🧑‍🏫</div>
                            <h3 className="font-display font-bold text-2xl text-white mb-3">For Teachers</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">Create and manage your courses, quizzes, and badges from a streamlined teacher portal — no technical skills needed.</p>
                            <ul className="space-y-3">
                                {[
                                    'Create unlimited courses with descriptions',
                                    'Add structured lessons with full text content',
                                    'Build MCQ quizzes with correct answer marking',
                                    'Define custom badges with unlock conditions',
                                    'Monitor all your published courses at a glance',
                                ].map(i => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                                        <Check size={14} className="text-violet-500 mt-0.5 flex-shrink-0" /> {i}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/signup" className="mt-8 inline-flex items-center gap-2 bg-violet-700 hover:bg-violet-600 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
                                Join as Teacher <ChevronRight size={15} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="py-28 px-6">
                <div className="max-w-3xl mx-auto text-center relative">
                    <div className="absolute inset-0 bg-emerald-600/15 rounded-full blur-[80px] pointer-events-none scale-150" />
                    <div className="relative z-10 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-14">
                        <span className="text-5xl block mb-5">🌍</span>
                        <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">Ready to make a difference?</h2>
                        <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                            Join EcoSphere today. Learn about our planet, earn your badges, and become part of the next generation of eco-conscious thinkers.
                        </p>
                        <Link to="/signup" className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-emerald-900/40 transition-all active:scale-95 text-base">
                            Get Started — It's Free
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <p className="text-slate-600 text-xs mt-5">No credit card required · Free for all students</p>
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="border-t border-white/5 px-8 py-8">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                            <Leaf size={13} className="text-white" />
                        </div>
                        <span className="font-display font-bold text-slate-300">EcoSphere</span>
                    </div>
                    <p className="text-slate-600 text-sm">© 2026 EcoSphere. Built for a greener future. 🌿</p>
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                        <Link to="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
                        <Link to="/signup" className="hover:text-slate-300 transition-colors">Sign Up</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
