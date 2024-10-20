const express = require('express');
const router = express.Router();

const db = require('../zconfig/db');
const { generateUpdateQuery, generateInsertQuery } = require('../zconfig/res');
const { verifyToken } = require('../zconfig/jwt');

// Add Location
router.post('/add', verifyToken, async (req, res) => {
	const { userid, justFetch } = req.body;

	if (justFetch) {
		const result = await db("SELECT * FROM user_locations where userid = ? and is_deleted=0", [userid]);
		// console.log("top", result);
		return res.send(result)
	}

	const insertSql = await generateInsertQuery('user_locations', { ...req.body })

	try {
		const result = await db(insertSql.sql, insertSql.fields);
		// console.log(result);
		if (result.affectedRows === 0) {
			return res.status(400).json({ message: 'Adding Location failed' });
		}
	} catch (error) {
		return res.status(400).json({ message: 'Adding Location failed' });
	}

	return res.send({ message: "Location Added successfully" })
});

// Update Location
router.post('/update', verifyToken, async (req, res) => {
	const { id, name, phone, address_text, latitude, longitude, } = req.body;

	const updateSql = await generateUpdateQuery('user_locations', { id, name, phone, address_text, latitude, longitude }, "id")

	try {
		const result = await db(updateSql.sql, updateSql.fields);
		// console.log(result);
		if (result.affectedRows === 0) {
			return res.status(500).json({ message: 'Updating Location failed' });
		}
	} catch (error) {
		return res.status(500).json({ message: 'Updating Location failed' });
	}

	return res.send({ message: "Location Updated successfully" })
});

module.exports = router;
