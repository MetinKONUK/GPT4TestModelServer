const { GoogleGenerativeAI } = require('@google/generative-ai');
const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const { codeExtracter } = require('./utils');

const sendQuery = async params => {
	const {
		focalCode,
		temperature,
		maxOutputTokens,
		stopSequences,
		topP,
		topK,
	} = params;
	const generationConfig = {
		temperature,
		maxOutputTokens,
		topP,
		topK,
		stopSequences,
	};
	const model = client.getGenerativeModel({
		model: 'gemini-pro',
		generationConfig,
	});
	const SYSTEM_PROMPT = `You are a unit test generator for Python codes.\
    User will give you plain Python codes and you are going to output plain Python unit test codes for it.`;
	const output = await model.generateContent(SYSTEM_PROMPT + focalCode);
	const response = output.response;
	return codeExtracter(response.text());
};

module.exports = sendQuery;
