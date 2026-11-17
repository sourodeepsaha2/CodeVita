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

const buildNextSession = ({ dueReflection, topics = [], problems = [], solvedIds = [] }) => {
    if (dueReflection) return recommendationForDueReflection(dueReflection);
    const solved = new Set(solvedIds.map(String));
    const unsolved = problems.filter((problem) => !solved.has(String(problem._id)));
    for (const topic of topics) {
        const matchingProblem = unsolved.find((problem) => problem.tags === topic.topic);
        if (matchingProblem) return recommendationForTopic(topic, matchingProblem);
    }
    return null;
};

module.exports = buildNextSession;
