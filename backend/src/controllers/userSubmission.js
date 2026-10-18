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

        
            let testCasesPassed = 0;
            let runtime = 0;
            let memory =0;
            let status = 'accepted';
            let errorMessage = null;

            for(const test of testResult)
            {
                if(test.status_id==3){
                    testCasesPassed++;
                    runtime = runtime+parseFloat(test.time);
                    memeory = Math.max(memory,test.memory);
                }
                else{
                    if(test.status_id==4)
                    {
                        status = 'error'
                        errorMessage = test.stderr
                    }
                    else{
                        status = 'wrong'
                    }
                }
            }

            submittedResult.status = status;
            submittedResult.testCasesPassed = testCasesPassed;
            submittedResult.errorMessage = errorMessage;
            submittedResult.runtime = runtime;
            submittedResult.memory = memeory;

            await submmittedResult.save();

            if(req.result.problemSolved.includes(problemId)){
                req.result.problemSolved.push(problemId);
                await req.result.save();
            }




            res.status(201).send(submitted);
    }
    catch(err){
        res.status(500).send("Internal server Error"+err)
    }

}
module.exports = submitCode;
