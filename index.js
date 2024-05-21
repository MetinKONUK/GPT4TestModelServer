const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 4000;
const queryOpenai = require('./openai');
const queryGemini = require('./gemini');
const queryLlama = require('./codellama');
const queryMixtral = require('./mixtral');
const {
	generatePerformanceData,
	logMessage,
	writeResultToExcel,
} = require('./utils');

server.use(bodyParser.json());
server.use(cors());

server.post('/isexecutable/', async (req, res) => {});

writeResultToExcel('index.xlsx', { Name: 'Metin', LastName: 'KONUK', Age: 21 });

server.post('/performance/openai', async (req, res) => {
	const {
		LLMName,
		id,
		modelSelection,
		temperature,
		maxLength,
		stopSequences,
		topP,
		frequencyPenalty,
		presencePenalty,
	} = req.body.modelSettings;
	const { focalCode } = req.body;

	const parameters = {
		focalCode,
		temperature,
		maxLength,
		stopSequences,
		topP,
		frequencyPenalty,
		presencePenalty,
		modelSelection,
	};
	const startTime = Date.now();
	const output = await queryOpenai(parameters);
	const endTime = Date.now();
	const elapsedTime = endTime - startTime;
	let generatedCode = output['testFunction'];
	let performanceResults = await generatePerformanceData(generatedCode);
	logMessage(
		JSON.stringify({
			...performanceResults,
			elapsedTime,
			model: modelSelection,
			timestamp: Date.now(),
		}),
		'performanceLogs'
	);
	const outputObj = { id, LLMName, ...performanceResults, elapsedTime };
	writeResultToExcel('logs.xlsx', outputObj);
	return res.status(200).send(outputObj);
});

server.post('/performance/gemini', async (req, res) => {
	const {
		id,
		LLMName,
		temperature,
		maxOutputTokens,
		topP,
		topK,
		stopSequences,
	} = req.body.modelSettings;
	const { focalCode } = req.body;

	const parameters = {
		focalCode,
		temperature,
		maxOutputTokens,
		stopSequences,
		topP,
		topK,
	};
	const startTime = Date.now();
	const generatedCode = await queryGemini(parameters);
	const endTime = Date.now();
	const elapsedTime = endTime - startTime;
	let performanceResults = await generatePerformanceData(generatedCode);

	logMessage(
		JSON.stringify({
			...performanceResults,
			elapsedTime,
			model: 'gemini',
			timestamp: Date.now(),
		}),
		'performanceLogs'
	);

	const outputObj = { id, LLMName, ...performanceResults, elapsedTime };
	writeResultToExcel('logs.xlsx', outputObj);
	return res.status(200).send(outputObj);

	// return res.status(200).send({ ...result, elapsedTime });
});

server.post('/performance/llama', async (req, res) => {
	console.log(req.body);
	const {
		id,
		LLMName,
		modelSelection,
		topP,
		topK,
		minTokens,
		maxTokens,
		temperature,
		repPenalty,
		presPenalty,
		freqPenalty,
	} = req.body.modelSettings;
	const { focalCode } = req.body;
	const parameters = {
		topK,
		topP,
		code: focalCode,
		minTokens,
		maxTokens,
		temperature,
		repPenalty,
		presPenalty,
		freqPenalty,
		modelName: modelSelection,
	};
	const startTime = Date.now();
	const generatedCode = await queryLlama(parameters);
	const endTime = Date.now();
	const elapsedTime = endTime - startTime;
	let performanceResults = await generatePerformanceData(generatedCode);

	logMessage(
		JSON.stringify({
			...performanceResults,
			elapsedTime,
			model: modelSelection,
			timestamp: Date.now(),
		}),
		'performanceLogs'
	);

	const outputObj = { id, LLMName, ...performanceResults, elapsedTime };
	writeResultToExcel('logs.xlsx', outputObj);
	return res.status(200).send(outputObj);
	// return res.status(200).send({ ...result, elapsedTime });
});

server.post('/performance/mistral', async (req, res) => {
	console.log(req.body);
	const {
		id,
		LLMName,
		modelSelection,
		topP,
		topK,
		minNewTokens,
		maxNewTokens,
		temperature,
		presPenalty,
		lenPenalty,
	} = req.body.modelSettings;
	const { focalCode } = req.body;
	const parameters = {
		topK,
		topP,
		code: focalCode,
		minNewTokens,
		maxNewTokens,
		temperature,
		presPenalty,
		lenPenalty,
	};

	const startTime = Date.now();
	const generatedCode = await queryMixtral(parameters);
	const endTime = Date.now();
	const elapsedTime = endTime - startTime;
	let performanceResults = await generatePerformanceData(generatedCode);

	logMessage(
		JSON.stringify({
			...performanceResults,
			elapsedTime,
			model: modelSelection,
			timestamp: Date.now(),
		}),
		'performanceLogs'
	);
	const outputObj = { id, LLMName, ...performanceResults, elapsedTime };
	writeResultToExcel('logs.xlsx', outputObj);
	return res.status(200).send(outputObj);
});

server.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
