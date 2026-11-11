const axios = require('axios');

const getRapidApiKey = () => {
	const apiKey = process.env.RAPIDAPI_KEY;
	if (!apiKey) throw new Error('RAPIDAPI_KEY environment variable is required');
	return apiKey;
};


const getlanguageById = (lang)=>{

    const language = {
        "c++":54,
        "java":62,
        "javascript":63
    }

    return language[lang.toLowerCase()];
}

const submitBatch = async (submissions)=>{

const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': getRapidApiKey(),
    'x-rapidapi-host': process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

return await fetchData();

}

const waiting = async(timer)=>{
  setTimeout(()=>{
    return 1;
  },timer)
}

const submitToken = async(resultToken)=>{
  const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    tokens: resultToken.join(","),
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': getRapidApiKey(),
    'x-rapidapi-host': process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

while(true){

const result = await fetchData();

const IsResultObtained = result.submissions.every((r)=>r.status_id>2);

if(IsResultObtained)
  return result.submissions

await waiting(1000)

}
}


module.exports={getlanguageById, submitBatch,submitToken};