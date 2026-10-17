const Problem = require("../models/problemModel");
const Submission = require("../models/submission");
const {getLanguageById,submitBatch} = require("../utils/ProblemUtility");



const submitCode = async(req,res)=>{

    //
    try{
        const userId = req.res._id;
        const problemId = req.params.id;

        const {code,language} = req.body;

        if(!userId || !code || !problemId || !language)
            return res.status(400).send("Some field missing");

        // Fetch the problem from database 
        const problem = await Problem.findById(problemId);

        const submittedResult = Submission.create({
            userId,
            problemId,
            code,
            language,
            status = 'pending',
            testCasesTotal: problem.hiddenTestCases.length
        })


        const languageId = getLanguageById(language);

        const submissions = visibleTestCases.map((testcase)=>({
                source_code:code,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

        const submitResult = await submitBatch(submissions);

        const resultToken = submitResult.map((value)=>value.token);

        const testResult = await submitToken(resultToken);

        


    }
    catch(err){

    }

}
module.exports = submitCode;
