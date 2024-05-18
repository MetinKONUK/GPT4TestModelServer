const Replicate = require('replicate');
const client = new Replicate({
	auth: process.env.REPLICATE_API_KEY,
});
const { codeExtracter } = require('./utils');

const sendQuery = async params => {
	const {
		topK,
		topP,
		code,
		temperature,
		lenPenalty,
		minNewTokens,
		maxNewTokens,
		presPenalty,
	} = params;
	const SYSTEM_PROMPT = `You are a unit test generator for Python codes.\
    User will give you plain Python codes and you are going to output plain Python unit test codes for it.`;

	const modelName = 'mistralai/mixtral-8x7b-instruct-v0.1';
	const output = await client.run(modelName, {
		input: {
			top_k: topK,
			top_p: topP,
			prompt: code,
			temperature,
			system_prompt: SYSTEM_PROMPT,
			length_penalty: lenPenalty,
			min_new_tokens: minNewTokens,
			max_new_tokens: maxNewTokens,
			prompt_template: '<s>[INST] {prompt} [/INST] ',
			presence_penalty: presPenalty,
		},
	});

	return codeExtracter(output.join(''));
};

module.exports = sendQuery;
