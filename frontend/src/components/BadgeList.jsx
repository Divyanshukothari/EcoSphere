import BadgeCard from './BadgeCard';

const BadgeList = ({ badges = [], userBadges = [] }) => {
    const earnedIds = new Set(userBadges.map(ub => ub.id));

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map(badge => (
                <BadgeCard
                    key={badge.id}
                    badge={badge}
                    unlocked={earnedIds.has(badge.id)}
                />
            ))}
            {badges.length === 0 && (
                <div className="col-span-full text-center py-10 text-slate-400">
                    <p className="text-4xl mb-2">🏅</p>
                    <p className="text-sm">No badges available for this course yet.</p>
                </div>
            )}
        </div>
    );
};

export default BadgeList;
