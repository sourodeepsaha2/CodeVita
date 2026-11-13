const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const Reflection = require("../models/reflection");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createProblem = async (req, res) => {
    try {
        const problem = await Problem.create({ ...req.body, problemCreator: req.result._id });
        return res.status(201).json({ problem });
    } catch (error) {
        return res.status(400).json({ error: error.message || "Could not create problem." });
    }
};

const updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!problem) return res.status(404).json({ error: "Problem not found." });
        return res.status(200).json({ problem });
    } catch (error) {
        return res.status(400).json({ error: error.message || "Could not update problem." });
    }
};

const deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndDelete(req.params.id);
        if (!problem) return res.status(404).json({ error: "Problem not found." });
        await Promise.all([
            Submission.deleteMany({ problemId: problem._id }),
            User.updateMany({}, { $pull: { problemSolved: problem._id } }),
            Reflection.updateMany({ problemId: problem._id }, { $set: { problemId: null, submissionId: null } }),
        ]);
        return res.status(200).json({ message: "Problem deleted." });
    } catch (error) {
        return res.status(500).json({ error: "Could not delete problem." });
    }
};

const getProblembyId = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id).select("_id title description difficulty tags visibleTestCases startCode");
        if (!problem) return res.status(404).json({ error: "Problem not found." });
        return res.status(200).json({ problem });
    } catch (error) {
        return res.status(400).json({ error: "Invalid problem id." });
    }
};

const getAllProblem = async (req, res) => {
    try {
        const { difficulty, tag, search } = req.query;
        const filter = {};
        if (["Easy", "Medium", "Hard"].includes(difficulty)) filter.difficulty = difficulty;
        if (tag) filter.tags = tag;
        if (search) filter.title = { $regex: escapeRegex(search.slice(0, 80)), $options: "i" };
        const [problems, user] = await Promise.all([
            Problem.find(filter).select("_id title difficulty tags").sort({ title: 1 }).lean(),
            User.findById(req.result._id).select("problemSolved").lean(),
        ]);
        const solved = new Set((user?.problemSolved || []).map(String));
        return res.status(200).json({ problems: problems.map((problem) => ({ ...problem, solved: solved.has(String(problem._id)) })) });
    } catch (error) {
        return res.status(500).json({ error: "Could not load problems." });
    }
};

const solvedAllProblembyUser = async (req, res) => {
    try {
        const user = await User.findById(req.result._id).populate({ path: "problemSolved", select: "_id title difficulty tags" });
        return res.status(200).json({ problems: user?.problemSolved || [] });
    } catch (error) {
        return res.status(500).json({ error: "Could not load solved problems." });
    }
};

const submittedProblem = async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.result._id, problemId: req.params.pid })
            .select("status runtime memory errorMessage testCasesPassed testCasesTotal language createdAt")
            .sort({ createdAt: -1 }).limit(25).lean();
        return res.status(200).json({ submissions });
    } catch (error) {
        return res.status(500).json({ error: "Could not load submissions." });
    }
};

module.exports = { createProblem, updateProblem, deleteProblem, getProblembyId, getAllProblem, solvedAllProblembyUser, submittedProblem };
