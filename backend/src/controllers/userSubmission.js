const Problem = require("../models/problem");
const Submission = require("../models/submission");
const redisClient = require("../config/redis");
const { getLanguageById, submitBatch, submitToken } = require("../utils/ProblemUtility");

const submitCode = async (req, res) => {
    let submission;
    try {
        const { code, language } = req.body || {};
        if (typeof code !== "string" || !code.trim() || code.length > 50000) {
            return res.status(400).json({ error: "Code is required and must be under 50,000 characters." });
        }
        if (typeof language !== "string") return res.status(400).json({ error: "Choose a supported language." });
        const normalizedLanguage = language.trim().toLowerCase();
        const languageId = getLanguageById(normalizedLanguage);
        if (!languageId) return res.status(400).json({ error: "Choose a supported language." });

        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ error: "Problem not found." });
        const testCases = [...(problem.visibleTestCases || []), ...(problem.hiddenTestCases || [])];
        if (!testCases.length) return res.status(400).json({ error: "This problem has no judge cases yet." });

        const rateLimit = await redisClient.set(`submission-rate:${req.result._id}`, "1", { NX: true, EX: 2 });
        if (!rateLimit) return res.status(429).json({ error: "Please wait a moment before submitting again." });

        submission = await Submission.create({
            userId: req.result._id,
            problemId: problem._id,
            code,
            language: normalizedLanguage,
            status: "pending",
            testCasesTotal: testCases.length,
        });

        const cases = testCases.map((testCase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testCase.input,
            expected_output: testCase.output,
        }));
        const queued = await submitBatch(cases);
        const tokens = queued.map((result) => result.token).filter(Boolean);
        if (tokens.length !== cases.length) throw new Error("The execution service could not queue every test case.");
        const results = await submitToken(tokens);
        if (results.length !== cases.length) throw new Error("The execution service returned an incomplete result.");

        let passed = 0;
        let runtime = 0;
        let memory = 0;
        let errorMessage = "";
        for (const result of results) {
            if (result.status_id === 3) {
                passed += 1;
                runtime += Number.parseFloat(result.time) || 0;
                memory = Math.max(memory, Number(result.memory) || 0);
            } else if (!errorMessage) {
                errorMessage = result.compile_output || result.stderr || result.message || result.status?.description || "The output did not match the expected result.";
            }
        }

        submission.status = passed === results.length ? "accepted" : (results.some((result) => result.status_id !== 4) ? "error" : "wrong");
        submission.testCasesPassed = passed;
        submission.runtime = runtime;
        submission.memory = memory;
        submission.errorMessage = errorMessage;
        await submission.save();

        if (submission.status === "accepted" && !req.result.problemSolved.some((id) => String(id) === String(problem._id))) {
            req.result.problemSolved.push(problem._id);
            await req.result.save();
        }

        return res.status(201).json({
            submission: {
                id: submission._id,
                status: submission.status,
                testCasesPassed: passed,
                testCasesTotal: results.length,
                runtime,
                memory,
                errorMessage,
            },
        });
    } catch (error) {
        if (submission) {
            submission.status = "error";
            submission.errorMessage = error.message || "Code execution failed.";
            await submission.save().catch(() => {});
        }
        return res.status(502).json({ error: error.message || "Code execution failed. Please try again." });
    }
};

module.exports = submitCode;
