const express = require('express');
const router = express.Router();

const db = require('../zconfig/db');
const { generateUpdateQuery } = require('../zconfig/res');
const { verifyToken } = require('../zconfig/jwt');

// Update user
router.post('/update', verifyToken, async (req, res) => {
	const { userid, type, justFetch, isDelete } = req.body;

	if (justFetch) {
		const result = await db("SELECT * FROM users where userid = ?", [userid]);
		// console.log("top", result);

		if (result.length === 0) {
			return res.send({ is_deleted: true })
		}
		return res.send(result[0])
	}

	if (!type) {
		return res.status(403).send({ message: 'Invalid Type' })
	}

	if (isDelete && !["location", "profile"].includes(isDelete)) {
		return res.status(403).send({ message: 'Invalid is Deleted' })
	}

	if (isDelete === "location") {
		return deleteLocation(req, res, userid)
	}

	if (type === "phone") {
		const updateSql = await generateUpdateQuery('users', req.body, "userid")

		try {
			const result = await db(updateSql.sql, updateSql.fields);

			if (result.affectedRows === 0) {
				return res.status(404).json({ message: 'User not found' });
			}
			else {
				let userResult = await db("SELECT * FROM users where userid = ?", [userid]);
				userResult = userResult[0]
				// console.log(result);
				return res.send(userResult)
			}
		} catch (error) {
			return res.status(500).json({ message: 'Could not update user' });
		}
	}
});

async function deleteLocation(req, res, userid) {
	let data = {
		userid,
		id: req.body.id,
		is_deleted: true
	}

	const updateSql = await generateUpdateQuery('user_locations', data, "id")

	const result = await db(updateSql.sql, updateSql.fields);

	if (result.affectedRows === 0) {
		return res.status(500).json({ message: 'Could not delete location' });
	}
	else {
		const result = await db("SELECT * FROM user_locations where userid = ? and is_deleted=0", [userid]);
		return res.send({ message: "Location deleted successfully", data: result })
	}
}

module.exports = router;
