const mongoose = require('mongoose');
const Submission = require('../models/submission');
const Reflection = require('../models/reflection');
const Problem = require('../models/problem');
const User = require('../models/user');
const buildNextSession = require('../utils/progressRecommendation');

const getProgress = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.result._id);
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setUTCHours(0, 0, 0, 0);
        weekStart.setUTCDate(weekStart.getUTCDate() - 41);

        const [totals, weekly, topics, recent, dueReflections, reflectionOutcomes, nextDueReflection, learner, problems] = await Promise.all([
            Submission.aggregate([
                { $match: { userId } },
                { $group: {
                    _id: null,
                    attempts: { $sum: 1 },
                    accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
                    solvedProblems: { $addToSet: { $cond: [{ $eq: ['$status', 'accepted'] }, '$problemId', null] } },
                } },
                { $project: { _id: 0, attempts: 1, accepted: 1, solved: { $size: { $filter: { input: '$solvedProblems', as: 'problem', cond: { $ne: ['$$problem', null] } } } } } },
            ]),
            Submission.aggregate([
                { $match: { userId, createdAt: { $gte: weekStart } } },
                { $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    attempts: { $sum: 1 },
                    accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
                } },
                { $sort: { _id: 1 } },
            ]),
            Submission.aggregate([
                { $match: { userId, status: { $in: ['wrong', 'error'] } } },
                { $lookup: { from: 'problems', localField: 'problemId', foreignField: '_id', as: 'problem' } },
                { $unwind: '$problem' },
                { $group: { _id: '$problem.tags', retries: { $sum: 1 }, problems: { $addToSet: '$problemId' } } },
                { $project: { _id: 0, topic: '$_id', retries: 1, problems: { $size: '$problems' } } },
                { $sort: { retries: -1, topic: 1 } },
                { $limit: 8 },
            ]),
            Submission.find({ userId }).select('problemId status language testCasesPassed testCasesTotal createdAt')
                .populate({ path: 'problemId', select: 'title tags difficulty' })
                .sort({ createdAt: -1 }).limit(8).lean(),
            Reflection.countDocuments({ userId, nextReviewAt: { $lte: now } }),
            Reflection.aggregate([
                { $match: { userId } },
                { $group: { _id: { $ifNull: ['$outcome', 'practice'] }, count: { $sum: 1 } } },
            ]),
            Reflection.findOne({ userId, nextReviewAt: { $lte: now } })
                .select('problem problemId confidence nextReviewAt').sort({ nextReviewAt: 1 }).lean(),
            User.findById(userId).select('problemSolved').lean(),
            Problem.find().select('_id title tags difficulty').sort({ title: 1 }).lean(),
        ]);

        const days = Array.from({ length: 42 }, (_, index) => {
            const date = new Date(weekStart);
            date.setUTCDate(date.getUTCDate() + index);
            return { date: date.toISOString().slice(0, 10), attempts: 0, accepted: 0 };
        });
        const dayMap = new Map(days.map((day) => [day.date, day]));
        for (const day of weekly) {
            const entry = dayMap.get(day._id);
            if (entry) { entry.attempts = day.attempts; entry.accepted = day.accepted; }
        }
        const summary = totals[0] || { attempts: 0, accepted: 0, solved: 0 };
        return res.status(200).json({
            summary: {
                ...summary,
                acceptanceRate: summary.attempts ? Math.round((summary.accepted / summary.attempts) * 100) : 0,
                dueReflections,
                breakthroughs: reflectionOutcomes.find((entry) => entry._id === 'breakthrough')?.count || 0,
                struggles: reflectionOutcomes.find((entry) => entry._id === 'struggle')?.count || 0,
            },
            activity: days,
            topics,
            recent: recent.map((attempt) => ({
                id: String(attempt._id),
                problem: attempt.problemId?.title || 'Problem removed',
                topic: attempt.problemId?.tags || 'Uncategorized',
                difficulty: attempt.problemId?.difficulty || '',
                status: attempt.status,
                language: attempt.language,
                testCasesPassed: attempt.testCasesPassed,
                testCasesTotal: attempt.testCasesTotal,
                createdAt: attempt.createdAt,
                problemId: attempt.problemId?._id ? String(attempt.problemId._id) : null,
            })),
        });
    } catch (error) {
        return res.status(500).json({ error: 'Could not load your learning progress.' });
    }
};

module.exports = getProgress;
