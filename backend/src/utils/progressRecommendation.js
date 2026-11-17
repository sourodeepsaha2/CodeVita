const recommendationForDueReflection = (reflection) => ({
    kind: 'due-review',
    title: `Close the loop on ${reflection.problem}`,
    detail: 'You already wrote a note about this attempt. Revisit it before moving on.',
    problem: reflection.problem,
    href: '/review?filter=due',
    action: 'Open due reflection',
});

const recommendationForTopic = (topic, problem) => ({
    kind: 'topic-practice',
    title: `Rebuild your ${topic.topic} confidence`,
    detail: `${topic.retries} failed attempts across ${topic.problems} ${topic.problems === 1 ? 'problem' : 'problems'} make this a useful topic to revisit.`,
    problem: problem.title,
    problemId: String(problem._id),
    topic: topic.topic,
    href: `/problems/${problem._id}?retry=blind`,
    action: 'Try a blind retry',
});

const recommendationForProblem = (problem) => ({
    kind: 'new-practice',
    title: 'Choose your next challenge',
    detail: 'Keep your practice moving with a problem you have not solved yet.',
    problem: problem.title,
    problemId: String(problem._id),
    topic: problem.tags,
    href: `/problems/${problem._id}`,
    action: 'Open problem',
});

const buildNextSession = ({ dueReflection, topics = [], problems = [], solvedIds = [] }) => {
    if (dueReflection) return recommendationForDueReflection(dueReflection);
    const solved = new Set(solvedIds.map(String));
    const unsolved = problems.filter((problem) => !solved.has(String(problem._id)));
    for (const topic of topics) {
        const matchingProblem = unsolved.find((problem) => problem.tags === topic.topic);
        if (matchingProblem) return recommendationForTopic(topic, matchingProblem);
    }
    if (topics.length) {
        return {
            kind: 'topic-review',
            title: `Revisit ${topics[0].topic}`,
            detail: 'Review your retry notes and the patterns you noticed in this topic.',
            topic: topics[0].topic,
            href: '/review?filter=struggle',
            action: 'Review retry notes',
        };
    }

    const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };
    unsolved.sort((a, b) => (difficultyOrder[a.difficulty] ?? 3) - (difficultyOrder[b.difficulty] ?? 3) || a.title.localeCompare(b.title));
    if (unsolved[0]) return recommendationForProblem(unsolved[0]);

    return {
        kind: 'catalog-complete',
        title: 'You have solved the full practice set',
        detail: 'Revisit a reflection or explore the catalog again to keep sharpening your approach.',
        href: '/review',
        action: 'Open your journal',
    };
};

module.exports = buildNextSession;
