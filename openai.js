const openai = require('openai');
const { codeExtracter } = require('./utils');
require('dotenv').config();

const client = new openai({
	apiKey: process.env.OPENAI_API_KEY,
});

const sendQuery = async params => {
	const {
		focalCode,
		temperature,
		maxLength,
		stopSequences,
		topP,
		frequencyPenalty,
		presencePenalty,
		modelSelection,
	} = params;
	const SYSTEM_PROMPT = `You are a unit test generator for Python codes.\
    User will give you plain Python codes and you are going to output plain Python unit test codes for it.`;

	const output = await client.chat.completions.create({
		model: modelSelection,
		messages: [
			{
				role: 'system',
				content: SYSTEM_PROMPT,
			},
			{
				role: 'user',
				content: focalCode,
			},
		],
		max_tokens: maxLength,
		temperature,
		top_p: topP,
		frequency_penalty: frequencyPenalty,
		presence_penalty: presencePenalty,
		stop: stopSequences,
	});
	// console.log(output.choices[0].message.content);
	return {
		code: 200,
		testFunction: codeExtracter(output.choices[0].message.content),
	};
};

module.exports = sendQuery;
