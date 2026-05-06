const BADGE_EMOJIS = {
    'Starter': '🌱',
    'Learner': '📗',
    'Master': '🎓',
    'Quiz Pro': '🏆',
    'default': '🏅'
};

const BadgeCard = ({ badge, unlocked = false, awardedAt }) => {
    const emoji = BADGE_EMOJIS[badge.title] || BADGE_EMOJIS['default'];

    return (
        <div className={`relative rounded-2xl border p-5 flex flex-col items-center gap-3 text-center transition-all duration-300 ${
            unlocked
                ? 'bg-gradient-to-br from-brand-50 to-emerald-50 border-brand-200 shadow-md shadow-brand-100/60 ' + (awardedAt ? 'animate-pop-in' : '')
                : 'bg-slate-50 border-slate-200 opacity-60 grayscale'
        }`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${
                unlocked ? 'bg-gradient-to-br from-brand-500 to-emerald-400 shadow-lg shadow-brand-400/30' : 'bg-slate-200'
            }`}>
                {unlocked ? emoji : '🔒'}
            </div>
            <div>
                <p className={`font-display font-semibold text-sm ${unlocked ? 'text-brand-800' : 'text-slate-500'}`}>
                    {badge.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{badge.description}</p>
            </div>
            {unlocked && (
                <span className="absolute top-3 right-3 text-xs bg-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded-full">
                    Earned ✓
                </span>
            )}
            {!unlocked && (
                <span className="text-xs text-slate-400">
                    {badge.condition_type === 'LESSONS'
                        ? `Complete ${badge.condition_value} lesson(s)`
                        : `Score ≥ ${badge.condition_value}%`}
                </span>
            )}
        </div>
    );
};

export default BadgeCard;
