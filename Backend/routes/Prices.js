const express = require('express');
const router = express.Router();
const db = require('../zconfig/db');

// Send price list to users
router.get('/', async (req, res) => {
	const adminSql = `SELECT price_table FROM adminpricetable`;
	let adminSqlResult = await db(adminSql)
	adminSqlResult = adminSqlResult[0]
	if (adminSqlResult) {
		return res.send(adminSqlResult.price_table)
	}

	return res.status(400).send({ message: 'No data found' })
});

module.exports = router;