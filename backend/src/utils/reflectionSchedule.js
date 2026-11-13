const REVIEW_INTERVAL_DAYS = [1, 2, 4, 7, 14];
const SNOOZE_DAYS = [1, 3, 7];

const nextReviewAt = (confidence, from = new Date()) => {
    const score = Math.min(5, Math.max(1, Number(confidence) || 1));
    const next = new Date(from);
    next.setDate(next.getDate() + REVIEW_INTERVAL_DAYS[score - 1]);
    return next;
};

const snoozedUntil = (days, from = new Date()) => {
    if (!SNOOZE_DAYS.includes(Number(days))) throw new RangeError('Choose a snooze period of 1, 3, or 7 days.');
    const next = new Date(from);
    next.setDate(next.getDate() + Number(days));
    return next;
};

module.exports = { nextReviewAt, snoozedUntil, REVIEW_INTERVAL_DAYS, SNOOZE_DAYS };
