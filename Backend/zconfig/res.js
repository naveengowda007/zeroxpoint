const dbTypes = require("./dbTypes");

async function generateInsertQuery(tableName, data) {
	const columns = Object.keys(data);

	let InsertQuery = `INSERT INTO ${tableName} (`;
	let fields = []

	for (let i = 0; i < columns.length; i++) {
		if (!data[columns[i]]) {
			continue
		}
		const valuePresent = await dbTypes[tableName].includes(columns[i])
		if (valuePresent) {
			fields.push(data[columns[i]])
			InsertQuery += `${columns[i]}, `;
		}
	}

	InsertQuery = InsertQuery.slice(0, -2); // Remove trailing comma and space
	InsertQuery += `) VALUES (`;


	for (let i = 0; i < fields.length; i++) {
		InsertQuery += `?, `;
	}

	InsertQuery = InsertQuery.slice(0, -2); // Remove trailing comma and space
	InsertQuery += `)`;

	return { sql: InsertQuery, fields };
}

async function generateUpdateQuery(tableName, data, primaryKey) {
	const columns = Object.keys(data);

	let updateQuery = `UPDATE ${tableName} SET `;

	let fields = []

	for (let i = 0; i < columns.length; i++) {
		if (data[columns[i]] === null || data[columns[i]] === undefined) {
			continue
		}
		const valuePresent = await dbTypes[tableName].includes(columns[i])
		if (columns[i] !== primaryKey && valuePresent) {
			fields.push(data[columns[i]])
			updateQuery += `${columns[i]} = ?, `;
		}
	}

	if (fields.length == 0) {
		return null;
	}

	updateQuery = updateQuery.slice(0, -2); // Remove trailing comma and space

	if (primaryKey) {
		fields.push(data[primaryKey])
		updateQuery += ` WHERE ${primaryKey} = ?`;
	}

	return { sql: updateQuery, fields };
}


function timeCountDown(previous) {
	let current = +new Date();

	const wtf = (previous - current) / 1000 / 60;
	if (wtf > -60 && wtf < 0) return "live";
	else if (wtf < -60) return "";

	const totalSeconds = Math.floor((previous - current) / 1000);
	const totalMinutes = Math.floor(totalSeconds / 60);
	const totalHours = Math.floor(totalMinutes / 60);
	const totalDays = Math.floor(totalHours / 24);

	const hours = totalHours - totalDays * 24;
	const minutes = totalMinutes - totalDays * 24 * 60 - hours * 60;
	const seconds =
		totalSeconds - totalDays * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

	if ([totalDays, hours, minutes].every((val) => val == 0)) return "";

	let temp = "";
	if (totalDays) temp += totalDays + "D ";
	if (hours) temp += hours + "H ";
	if (minutes) temp += minutes + "M ";
	temp += seconds + "S";

	return temp;
}

function nFormatter(num, digits) {
	const lookup = [
		{ value: 1, symbol: "" },
		{ value: 1e3, symbol: "k" },
		{ value: 1e6, symbol: "M" },
		{ value: 1e9, symbol: "B" },
		{ value: 1e12, symbol: "T" },
		{ value: 1e15, symbol: "P" },
		{ value: 1e18, symbol: "E" },
	];
	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	var item = lookup
		.slice()
		.reverse()
		.find(function (item) {
			return num >= item.value;
		});
	return item
		? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
		: "0";
}

function differenceInDays(checkDate) {
	let timestamp = new Date(checkDate);
	let now = new Date();

	return (now - timestamp) / (1000 * 60 * 60 * 24)
}

module.exports = {
	generateInsertQuery,
	generateUpdateQuery,
	timeCountDown,
	nFormatter,
	differenceInDays
};