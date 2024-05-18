const { PythonShell } = require('python-shell');
const fs = require('fs');

const logMessage = (message, filename) => {
	let basePath = './logs/';
	fs.appendFile(basePath + `${filename}.txt`, message + '\n', err => {
		if (err) throw err;
		return true;
	});
};

const codeExtracter = text => {
	let start = text.indexOf('```python');
	if (start === -1) return text;
	let remainingText = text.slice(start + 10, text.length);
	console.log('remaining text', remainingText);
	let end = remainingText.indexOf('```');
	return text.slice(start + 10, start + end + 9);
};

const parsePythonCode = code => {
	return new Promise(async (resolve, reject) => {
		let pythonFilePath = './pythonScripts/index.py';
		let messages = [];
		let options = {
			mode: 'text',
			args: [code],
		};

		let shell = new PythonShell(pythonFilePath, options);
		shell.on('message', message => {
			messages.push(message);
		});

		shell.on('stderr', stderr => {
			reject(stderr);
		});

		shell.on('error', error => {
			reject(error);
		});

		shell.end(error => {
			if (error) reject(error);
			resolve(messages.join('\n'));
		});
	});
};

const generatePerformanceData = async code => {
	let isExecutable = 1;
	let [assertionCount, uniqueVariableCount, uniqueParamCount, codeLength] = [
		0, 0, 0, 0,
	];
	try {
		let parseResult = await parsePythonCode(code);
		[assertionCount, uniqueVariableCount, uniqueParamCount, codeLength] =
			parseResult.split(',').map(number => parseInt(number));
	} catch (error) {
		console.error(error);
		isExecutable = 0;
	}
	return {
		code,
		isExecutable,
		assertionCount,
		uniqueVariableCount,
		uniqueParamCount,
		codeLength,
	};
};

module.exports = {
	generatePerformanceData: generatePerformanceData,
	codeExtracter: codeExtracter,
	logMessage: logMessage,
};
