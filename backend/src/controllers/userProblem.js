const {getLanguageById,submitBatch,submitToken} = require("../utils/ProblemUtility");
const Problem = require("../models/problem")

const createProblem = async (req,res)=>{
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator} = req.body;

    try{

        for(const {language,completeCode} of referenceSolution)
        {
            // source_code:
            //language_id:
            //stdin:
            //expectedOutput:

            const languageId = getlangageById(language);

            //I am creating Batch submission
            const submissions = visibleTestCases.map((testcase)=>({
                source_code:completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submission);

            const resultToken = submitResult.map((value)=>value.token); // an array of token

            const testResult = await submitToken(resultToken);

            for(const test of testResult){
                if(test.status_id!=3){
                   return res.status(400).send("Error Occured");
                }
            }
        }
        // We can store it in DB

        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });

        res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);

    }
}

const updateProblem = async(req,res)=>{

    const {id} = req.params
    const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator} = req.body;

    try{
        if(!id){
            return res.staus(400).send("Invalid Id Field");
        }

        const DsaProblem = await Problem.findById(id);

        if(!DsaProblem)
            return res.status(404).send("ID is not present in server");

        for(const {language,completeCode} of referenceSolution)
        {
            // source_code:
            //language_id:
            //stdin:
            //expectedOutput:

            const languageId = getlangageById(language);

            //I am creating Batch submission
            const submissions = visibleTestCases.map((testcase)=>({
                source_code:completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submission);

            const resultToken = submitResult.map((value)=>value.token); // an array of token

            const testResult = await submitToken(resultToken);

            for(const test of testResult){
                if(test.status_id!=3){
                   return res.status(400).send("Error Occured");
                }
            }
        }

        await Problem.findByIdAndUpdate(id , {...req.body}, {runValidators:true, new:true});

        res.status(200).send(newProblem);
    }
    catch(err){
        res.staus(404).send("Error: "+err);
    }
}

const deleteProblem = async(req,res)=>{

    const {id}=req.params;

    try{
        if(!id){
            return res.status(400).send("ID is missing");
        }
        const deletedProblem = Problem.findByIdAndDelete(id);

        if(!deletedProblem)
            return res.status(404).send("Problem is Missing");

        res.status(200).send("Succesfully Deleted");
    }
    catch(err){
        res.status(500).send("Error "+err)
    }
}

module.exports = {createProblem,updateProblem};