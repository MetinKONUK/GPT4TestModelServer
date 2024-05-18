const Replicate = require('replicate');
const client = new Replicate({
	auth: process.env.REPLICATE_API_KEY,
});
const { codeExtracter } = require('./utils');

const sendQuery = async params => {
	const models = {
		'CodeLlama-13b':
			'meta/codellama-13b:511fc67df70ee2d584375b6f1463d8d7d9ca7e6131e0f0a879d32d99bce17351',
		'CodeLlama-34b-Python':
			'meta/codellama-13b-python:d400c37e08686baf35c563ea8f9bc43c374549a9658c3c4ec531e6bdaf61532b',
		'Llama-70b': 'meta/meta-llama-3-70b',
	};
	const {
		topK,
		topP,
		code,
		minTokens,
		maxTokens,
		temperature,
		repPenalty,
		presPenalty,
		freqPenalty,
		modelName,
	} = params;
	const SYSTEM_PROMPT = `\n# write unit test of the following code: `;

	const output = await client.run(models[modelName], {
		input: {
			top_k: topK,
			top_p: topP,
			prompt: SYSTEM_PROMPT + code,
			min_tokens: 512,
			max_tokens: maxTokens,
			temperature,
			repeat_penalty: repPenalty,
			presence_penalty: presPenalty,
			frequency_penalty: freqPenalty,
		},
	});
	return codeExtracter(output.join(''));
};

module.exports = sendQuery;
