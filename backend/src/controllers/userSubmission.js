const Problem = require("../models/problemModel");
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

        


    }
    catch(err){

    }

}
module.exports = submitCode;
