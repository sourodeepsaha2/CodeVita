const axios = require('axios');


const getlanguageById = (lang)=>{

    const language = {
        "c++":54,
        "java":62,
        "javascript":63
    }

    return language[lang.toLowerCase()];
}

const submitBatch = async (submissions)=>{


}














module.exports={getlanguageById, submitBatch};