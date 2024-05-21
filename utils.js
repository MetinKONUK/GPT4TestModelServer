const { PythonShell } = require('python-shell');
const fs = require('fs');
const XLSX = require('xlsx');

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

function writeResultToExcel(filePath, dataObj) {
	try {
		let workbook;
		let worksheet;
		const wsName = 'Sheet1';

		if (!fs.existsSync(filePath)) {
			workbook = XLSX.utils.book_new();
			worksheet = XLSX.utils.aoa_to_sheet([]);
			XLSX.utils.book_append_sheet(workbook, worksheet, wsName);
		} else {
			workbook = XLSX.readFile(filePath, { cellDates: true });
			worksheet = workbook.Sheets[wsName];
			if (!worksheet) {
				worksheet = XLSX.utils.aoa_to_sheet([]);
				XLSX.utils.book_append_sheet(workbook, worksheet, wsName);
			}
		}

		const keys = Object.keys(dataObj);
		const values = Object.values(dataObj);

		let range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
		let nextRow = range.e.r + 1;

		if (nextRow === 1) {
			keys.forEach((key, colIndex) => {
				worksheet[XLSX.utils.encode_cell({ r: 0, c: colIndex })] = {
					v: key,
				};
			});
			nextRow = 1;
		}

		values.forEach((value, colIndex) => {
			worksheet[XLSX.utils.encode_cell({ r: nextRow, c: colIndex })] = {
				v: value,
			};
		});

		range.e.r = nextRow;
		range.e.c = keys.length - 1;
		worksheet['!ref'] = XLSX.utils.encode_range(range);

		XLSX.writeFile(workbook, filePath);
		console.log('Data written successfully!');
	} catch (error) {
		console.error('Error writing data:', error);
	}
}

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
	writeResultToExcel,
};
