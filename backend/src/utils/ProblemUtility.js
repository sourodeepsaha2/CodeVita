const axios = require('axios');

const LANGUAGES = { 'c++': 54, java: 62, javascript: 63 };
const getLanguageById = (language) => LANGUAGES[String(language || '').toLowerCase()];

const getClient = () => {
    const key = process.env.RAPIDAPI_KEY;
    if (!key) throw new Error('Code execution is not configured.');
    return axios.create({
        baseURL: `https://${process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com'}`,
        timeout: 20000,
        headers: {
            'x-rapidapi-key': key,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json',
        },
    });
};

const submitBatch = async (submissions) => {
    const client = getClient();
    const response = await client.post('/submissions/batch', { submissions }, { params: { base64_encoded: 'false' } });
    if (!Array.isArray(response.data)) throw new Error('Execution service returned an invalid response.');
    return response.data;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const submitToken = async (tokens) => {
    const client = getClient();
    for (let attempt = 0; attempt < 30; attempt += 1) {
        await delay(attempt === 0 ? 700 : 1000);
        const response = await client.get('/submissions/batch', {
            params: { tokens: tokens.join(','), base64_encoded: 'false', fields: '*' },
        });
        const results = response.data?.submissions;
        if (!Array.isArray(results)) throw new Error('Execution service returned an invalid response.');
        if (results.every((result) => result.status_id > 2)) return results;
    }
    throw new Error('Code execution timed out. Please try again.');
};

module.exports = { getLanguageById, getlanguageById: getLanguageById, submitBatch, submitToken };
