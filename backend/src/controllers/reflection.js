const { randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
const Reflection = require('../models/reflection');
const Problem = require('../models/problem');
const Submission = require('../models/submission');
const { nextReviewAt, snoozedUntil } = require('../utils/reflectionSchedule');

const serialize = (reflection) => ({
    id: String(reflection._id),
    clientId: reflection.clientId,
    problemId: reflection.problemId ? String(reflection.problemId) : undefined,
    submissionId: reflection.submissionId ? String(reflection.submissionId) : undefined,
    problem: reflection.problem,
    approach: reflection.approach,
    blocker: reflection.blocker || '',
    confidence: reflection.confidence,
    nextReviewAt: reflection.nextReviewAt,
    reviewCount: reflection.reviewCount,
    isFavorite: reflection.isFavorite,
    createdAt: reflection.createdAt,
    lastReviewedAt: reflection.lastReviewedAt || undefined,
});

const validDate = (value) => value !== undefined && !Number.isNaN(Date.parse(value));
const validId = (value) => typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);

const getReflections = async (req, res) => {
    try {
        const reflections = await Reflection.find({ userId: req.result._id }).sort({ nextReviewAt: 1, createdAt: -1 }).lean();
        return res.status(200).json({ reflections: reflections.map(serialize) });
    } catch (error) {
        return res.status(500).json({ error: 'Could not load your reflection journal.' });
    }
};

const createReflection = async (req, res) => {
    try {
        const input = req.body || {};
        const problem = typeof input.problem === 'string' ? input.problem.trim() : '';
        const approach = typeof input.approach === 'string' ? input.approach.trim() : '';
        const blocker = typeof input.blocker === 'string' ? input.blocker.trim() : '';
        const confidence = Number(input.confidence);
        if (!problem || problem.length > 160 || !approach || approach.length > 4000 || blocker.length > 2000 || !Number.isInteger(confidence) || confidence < 1 || confidence > 5) {
            return res.status(400).json({ error: 'Add a problem, an approach, and a confidence score from 1 to 5. Notes must fit within the stated field limits.' });
        }

        let problemId = null;
        if (input.problemId) {
            if (!validId(input.problemId)) return res.status(400).json({ error: 'Invalid problem reference.' });
            const foundProblem = await Problem.exists({ _id: input.problemId });
            if (!foundProblem) return res.status(400).json({ error: 'The linked problem no longer exists.' });
            problemId = input.problemId;
        }

        let submissionId = null;
        if (input.submissionId) {
            if (!validId(input.submissionId)) return res.status(400).json({ error: 'Invalid submission reference.' });
            const submission = await Submission.findOne({ _id: input.submissionId, userId: req.result._id }).select('_id status');
            if (!submission || !['wrong', 'error'].includes(submission.status)) {
                return res.status(400).json({ error: 'Reflections can only be linked to your own failed attempt.' });
            }
            submissionId = submission._id;
        }

        const clientId = typeof input.clientId === 'string' && input.clientId.trim().length > 0 && input.clientId.trim().length <= 80
            ? input.clientId.trim()
            : randomUUID();
        const existing = await Reflection.findOne({ userId: req.result._id, clientId });
        if (existing) return res.status(200).json({ reflection: serialize(existing), created: false });

        const reflection = await Reflection.create({
            userId: req.result._id,
            clientId,
            problemId,
            submissionId,
            problem,
            approach,
            blocker,
            confidence,
            nextReviewAt: nextReviewAt(confidence),
        });
        return res.status(201).json({ reflection: serialize(reflection), created: true });
    } catch (error) {
        if (error.code === 11000) {
            const existing = await Reflection.findOne({ userId: req.result._id, clientId: req.body?.clientId }).catch(() => null);
            if (existing) return res.status(200).json({ reflection: serialize(existing), created: false });
        }
        return res.status(500).json({ error: 'Could not save this reflection.' });
    }
};

const importReflections = async (req, res) => {
    try {
        const entries = req.body?.reflections;
        if (!Array.isArray(entries) || entries.length < 1 || entries.length > 250) {
            return res.status(400).json({ error: 'Import between 1 and 250 journal entries at a time.' });
        }

        const prepared = [];
        const clientIds = new Set();
        for (const input of entries) {
            if (!input || typeof input !== 'object' || Array.isArray(input)) return res.status(400).json({ error: 'The backup contains an invalid reflection entry.' });
            const problem = typeof input?.problem === 'string' ? input.problem.trim() : '';
            const approach = typeof input?.approach === 'string' ? input.approach.trim() : '';
            const blocker = typeof input?.blocker === 'string' ? input.blocker.trim() : '';
            const confidence = Number(input?.confidence);
            if (!problem || problem.length > 160 || !approach || approach.length > 4000 || blocker.length > 2000 || !Number.isInteger(confidence) || confidence < 1 || confidence > 5) {
                return res.status(400).json({ error: 'The backup contains an incomplete or invalid reflection.' });
            }
            const clientIdValue = input.clientId || input.id;
            const clientId = typeof clientIdValue === 'string' && clientIdValue.trim().length <= 80 ? clientIdValue.trim() : '';
            if (!clientId || clientIds.has(clientId)) return res.status(400).json({ error: 'The backup contains a missing or duplicate entry id.' });
            clientIds.add(clientId);
            const createdAt = validDate(input.createdAt) ? new Date(input.createdAt) : new Date();
            const dueDate = validDate(input.nextReviewAt) ? new Date(input.nextReviewAt) : nextReviewAt(confidence, createdAt);
            const lastReviewedAt = validDate(input.lastReviewedAt) ? new Date(input.lastReviewedAt) : null;
            const reviewCount = Number.isInteger(Number(input.reviewCount)) && Number(input.reviewCount) >= 0 ? Number(input.reviewCount) : 0;
            prepared.push({
                userId: req.result._id,
                clientId,
                problem,
                approach,
                blocker,
                confidence,
                createdAt,
                nextReviewAt: dueDate,
                lastReviewedAt,
                reviewCount,
                isFavorite: input.isFavorite === true,
                problemId: validId(input.problemId) ? input.problemId : null,
                submissionId: validId(input.submissionId) ? input.submissionId : null,
            });
        }

        const referencedProblemIds = [...new Set(prepared.map((reflection) => reflection.problemId).filter(Boolean).map(String))];
        const existingProblemIds = new Set((await Problem.find({ _id: { $in: referencedProblemIds } }).distinct('_id')).map(String));
        for (const reflection of prepared) {
            if (reflection.problemId && !existingProblemIds.has(String(reflection.problemId))) reflection.problemId = null;
        }
        const referencedSubmissionIds = [...new Set(prepared.map((reflection) => reflection.submissionId).filter(Boolean).map(String))];
        const ownedSubmissionIds = new Set((await Submission.find({ _id: { $in: referencedSubmissionIds }, userId: req.result._id, status: { $in: ['wrong', 'error'] } }).distinct('_id')).map(String));
        for (const reflection of prepared) {
            if (reflection.submissionId && !ownedSubmissionIds.has(String(reflection.submissionId))) reflection.submissionId = null;
        }

        const operations = prepared.map((reflection) => ({
            updateOne: {
                filter: { userId: req.result._id, clientId: reflection.clientId },
                update: { $setOnInsert: reflection },
                upsert: true,
            },
        }));
        const result = await Reflection.bulkWrite(operations, { ordered: true });
        return res.status(200).json({ imported: result.upsertedCount || 0, reflections: prepared.length });
    } catch (error) {
        return res.status(500).json({ error: 'Could not import this journal backup.' });
    }
};

const updateReflection = async (req, res) => {
    try {
        const changes = {};
        for (const field of ['problem', 'approach', 'blocker']) {
            if (req.body?.[field] === undefined) continue;
            if (typeof req.body[field] !== 'string') return res.status(400).json({ error: `Invalid ${field}.` });
            changes[field] = req.body[field].trim();
        }
        if (changes.problem !== undefined && (!changes.problem || changes.problem.length > 160)) return res.status(400).json({ error: 'Problem name must be 1–160 characters.' });
        if (changes.approach !== undefined && (!changes.approach || changes.approach.length > 4000)) return res.status(400).json({ error: 'Approach must be 1–4,000 characters.' });
        if (changes.blocker !== undefined && changes.blocker.length > 2000) return res.status(400).json({ error: 'Blocker note must be at most 2,000 characters.' });
        if (req.body?.confidence !== undefined) {
            const confidence = Number(req.body.confidence);
            if (!Number.isInteger(confidence) || confidence < 1 || confidence > 5) return res.status(400).json({ error: 'Confidence must be from 1 to 5.' });
            changes.confidence = confidence;
        }
        if (req.body?.isFavorite !== undefined) {
            if (typeof req.body.isFavorite !== 'boolean') return res.status(400).json({ error: 'Favorite state must be a boolean.' });
            changes.isFavorite = req.body.isFavorite;
        }
        const reflection = await Reflection.findOneAndUpdate(
            { _id: req.params.id, userId: req.result._id }, changes, { new: true, runValidators: true }
        );
        if (!reflection) return res.status(404).json({ error: 'Reflection not found.' });
        return res.status(200).json({ reflection: serialize(reflection) });
    } catch (error) {
        return res.status(400).json({ error: 'Could not update this reflection.' });
    }
};

const markReviewed = async (req, res) => {
    try {
        const reflection = await Reflection.findOne({ _id: req.params.id, userId: req.result._id });
        if (!reflection) return res.status(404).json({ error: 'Reflection not found.' });
        const reviewedAt = new Date();
        reflection.lastReviewedAt = reviewedAt;
        reflection.nextReviewAt = nextReviewAt(reflection.confidence, reviewedAt);
        reflection.reviewCount += 1;
        await reflection.save();
        return res.status(200).json({ reflection: serialize(reflection) });
    } catch (error) {
        return res.status(400).json({ error: 'Could not schedule this reflection.' });
    }
};

const snoozeReflection = async (req, res) => {
    try {
        const reflection = await Reflection.findOne({ _id: req.params.id, userId: req.result._id });
        if (!reflection) return res.status(404).json({ error: 'Reflection not found.' });
        reflection.nextReviewAt = snoozedUntil(req.body?.days);
        await reflection.save();
        return res.status(200).json({ reflection: serialize(reflection) });
    } catch (error) {
        return res.status(400).json({ error: error instanceof RangeError ? error.message : 'Could not snooze this reflection.' });
    }
};

const deleteReflection = async (req, res) => {
    try {
        const deleted = await Reflection.findOneAndDelete({ _id: req.params.id, userId: req.result._id });
        if (!deleted) return res.status(404).json({ error: 'Reflection not found.' });
        return res.status(200).json({ message: 'Reflection deleted.' });
    } catch (error) {
        return res.status(400).json({ error: 'Could not delete this reflection.' });
    }
};

module.exports = { getReflections, createReflection, importReflections, updateReflection, markReviewed, snoozeReflection, deleteReflection };
