const recommendationForDueReflection = (reflection) => ({
    kind: 'due-review',
    title: `Close the loop on ${reflection.problem}`,
    detail: 'You already wrote a note about this attempt. Revisit it before moving on.',
    problem: reflection.problem,
    href: '/review?filter=due',
    action: 'Open due reflection',
});

const buildNextSession = ({ dueReflection }) => {
    if (dueReflection) return recommendationForDueReflection(dueReflection);
    return null;
};

module.exports = buildNextSession;
