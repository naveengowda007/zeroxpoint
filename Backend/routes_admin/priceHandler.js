var express = require('express');
var router = express.Router();
const db = require('../zconfig/db');

const { generateInsertQuery, generateUpdateQuery } = require('../zconfig/res');
const { verifyAdminToken, verifyToken } = require('../zconfig/jwt');
const CONFIG = require('../zconfig/CONFIG');


// Send admin price
router.post('/getAdminPrice', verifyAdminToken, async (req, res) => {
	let sql = `SELECT price_table FROM adminpricetable`;
	let searchResult = await db(sql)
	searchResult = searchResult[0]
	if (!searchResult) {
		return res.status(400).send({ message: 'No data found' })
	}
	return res.send(searchResult)
});

// Set admin price
router.post('/setAdminPrice', verifyAdminToken, async (req, res) => {
	let price_table = req.body.data
	price_table = JSON.stringify(price_table)

	await db("truncate table adminpricetable") // Truncate table to maintain one row
	const sql = await generateInsertQuery('adminpricetable', { price_table })
	let result = await db(sql.sql, sql.fields)
	if (result.affectedRows === 0) {
		return res.status(400).send({ message: 'Data request failed' })
	}

	res.send({ message: 'ok' })
});

// Send verdor price
router.post('/getVendorPrice', verifyToken, async (req, res) => {
	const { userid, justFetch } = req.body
	const userSql = "SELECT default_priceTable_id FROM shops where userid = ?"
	let result = await db(userSql, [userid])
	result = result[0]
	if (!result) {
		return res.status(400).send({ message: 'No data found' })
	}

	// Send verdor price list
	let sql = `SELECT price_table FROM vendorpricetable where id = ?`;
	let searchResult = await db(sql, [result.default_priceTable_id])
	searchResult = searchResult[0]
	if (searchResult) {
		return res.send(searchResult)
	} else if (justFetch) {
		return res.status(400).send({ message: 'No data found' })
	}

	// If not set, send a copy of admin table
	let adminSql = `SELECT price_table FROM adminpricetable`;
	let adminSqlResult = await db(adminSql)
	adminSqlResult = adminSqlResult[0]
	if (!adminSqlResult) {
		return res.status(400).send({ message: 'No data found' })
	}

	adminSqlResult.priceNotSet = true
	let price_table = adminSqlResult.price_table
	price_table.PaperSizeData.map(item => {
		item.bwDoubleSide = ""
		item.bwSingleSide = ""
		item.colorDoubleSide = ""
		item.colorSingleSide = ""
	})
	price_table.bindingOptions.map(item => {
		item.price = ""
	})
	return res.send(adminSqlResult)
});


// Set vendor price
router.post('/setVendorPrice', verifyToken, async (req, res) => {
	const { userid } = req.user
	let price_table = req.body.data
	price_table = JSON.stringify(price_table)

	const sql = await generateInsertQuery('vendorpricetable', { userid, price_table })
	let result = await db(sql.sql, sql.fields)
	if (result.affectedRows === 0) {
		return res.status(400).send({ message: 'Data request failed' })
	}

	const default_priceTable_id = result.insertId
	const updateSql = await generateUpdateQuery('shops', { userid, default_priceTable_id }, "userid")
	const udpateResult = await db(updateSql.sql, updateSql.fields);
	// console.log(result);
	if (udpateResult.affectedRows === 0) {
		return res.status(400).send({ message: 'Data request failed' })
	}
	return res.json({ message: "Payment info updated succesfully" });
});


module.exports = router;