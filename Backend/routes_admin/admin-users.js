var express = require('express');
var router = express.Router();
const db = require('../zconfig/db');

const { generateInsertQuery } = require('../zconfig/res');
const { verifyAdminToken, verifyToken } = require('../zconfig/jwt');
const CONFIG = require('../zconfig/CONFIG');

// Constants
const { RowsPerPage } = CONFIG

// Send user list
router.post('/getUsers', verifyAdminToken, async (req, res) => {
	const { page } = req.query;
	let offset = 0
	if (page) {
		offset = (page - 1) * RowsPerPage;
	}

	const users = await db(`SELECT userid, name, phone, email, is_deleted, created_at FROM users ORDER BY created_at DESC LIMIT ${RowsPerPage} OFFSET ${offset}`);
	const count = await db(`SELECT COUNT(*) FROM users`);
	const totalPages = Math.ceil(count[0]['COUNT(*)'] / RowsPerPage);
	res.send({ users, totalPages });
});

// Send user data
router.post('/getUser/:uid', verifyAdminToken, async (req, res) => {
	const { uid } = req.params

	const user = await db(`SELECT name, phone, email, is_deleted, created_at FROM users WHERE userid = ?`, [uid]);
	if (user.length === 0)
		return res.status(403).send({ message: 'Something went wrong' })

	let result = user[0]
	const locationSql = await db(`SELECT * FROM user_locations WHERE userid = ? AND is_deleted = 0`, [uid]);
	result.userLocations = locationSql

	return res.send(result);
});


module.exports = router;