var express = require('express');
var router = express.Router();
const db = require('../zconfig/db');

const { generateInsertQuery, generateUpdateQuery } = require('../zconfig/res');
const { verifyAdminToken, verifyToken } = require('../zconfig/jwt');
const CONFIG = require('../zconfig/CONFIG');


// Set vendor price
router.post('/getDashboard', verifyToken, async (req, res) => {
	const { userid, type } = req.user

	if (type === 'admin') {
		const orderCount = (await db('SELECT COUNT(*) FROM orders'))[0]['COUNT(*)'];
		const newOrderCount = (await db(`SELECT COUNT(*) FROM orders WHERE CONVERT_TZ(created_at, '+00:00', '+05:30') BETWEEN CURDATE() AND CURDATE() + INTERVAL 1 DAY`))[0]['COUNT(*)'];
		const userCount = (await db('SELECT COUNT(*) FROM users'))[0]['COUNT(*)'];
		const vendorCount = (await db('SELECT COUNT(*) FROM shops'))[0]['COUNT(*)'];

		const data = { newOrderCount, orderCount, userCount, vendorCount }
		return res.json(data);
	}

	else if (type === 'vendor') {
		const user = (await db('SELECT id FROM shops WHERE userid = ?', [userid]))[0];
		const orderCount = (await db(`SELECT COUNT(*) FROM orders WHERE JSON_CONTAINS(shop_id, '?')`, [user.id]))[0]['COUNT(*)'];
		const newOrderCount = (await db(`SELECT COUNT(*) FROM orders WHERE JSON_CONTAINS(shop_id, '?') AND CONVERT_TZ(created_at, '+00:00', '+05:30') BETWEEN CURDATE() AND CURDATE() + INTERVAL 1 DAY`, [user.id]))[0]['COUNT(*)'];

		const data = { newOrderCount, orderCount }
		return res.json(data);
	}

	return res.status(403).json({ msg: "Invalid request" });
});

// Search
router.post('/search', verifyAdminToken, async (req, res) => {
	const { value } = req.body;

	if (!value)
		return res.status(401).send({ message: "Invalid parameters" })

	let orderId = null;


	// Check if the value starts with ZP0 and followed by numbers
	if (/^ZP0\d+$/i.test(value)) {
		orderId = value.substring(3); // Get the orderId
		orderId = parseInt(orderId);
	} else if (!isNaN(value)) { // Check if the value is a number
		orderId = parseInt(value);
	}

	try {
		const result = []
		const orderQuery = `SELECT id, created_at FROM orders WHERE CONVERT(id, CHAR) LIKE '%?%' LIMIT 10;`;
		const orders = await db(orderQuery, [orderId]);
		result.push(...orders)

		const userQuery = `SELECT userid, name, phone FROM users WHERE name LIKE '%${value}%' OR phone LIKE '%${orderId}%' LIMIT 10;`;
		const users = await db(userQuery);
		result.push(...users)

		const shopQuery = `SELECT userid, vendor_name, shop_name, phone FROM shops WHERE vendor_name LIKE '%${value}%' OR shop_name LIKE '%${value}%' OR phone LIKE '%${orderId}%' LIMIT 10;`;
		const shops = await db(shopQuery);
		result.push(...shops)

		return res.send(result);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal server error' });
	}
});


// search4Vendor
router.post('/search4Vendor', verifyToken, async (req, res) => {
	const user = req.user
	const { value } = req.body;

	if (!value)
		return res.status(401).send({ message: "Invalid parameters" })

	let orderId = null;

	// Check if the value starts with ZP0 and followed by numbers
	if (/^ZP0\d+$/i.test(value)) {
		orderId = value.substring(3); // Get the orderId
		orderId = parseInt(orderId);
	} else if (!isNaN(value)) { // Check if the value is a number
		orderId = parseInt(value);
	}

	try {
		const orders = await db(`SELECT id, created_at FROM orders WHERE JSON_CONTAINS(shop_id, '?') AND CONVERT(id, CHAR) LIKE '%?%' LIMIT 10;`, [user.id, orderId]);
		return res.send(orders);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal server error' });
	}
});


// Search
router.post('/godView', verifyAdminToken, async (req, res) => {
	try {
		const userQuery = `SELECT userid, name, latitude, longitude FROM user_locations;`;
		const users = await db(userQuery);

		const shopQuery = `SELECT userid, shop_name, latitude, longitude FROM shops;`;
		const shops = await db(shopQuery);

		const result = {
			users,
			shops
		}
		return res.send(result);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal server error' });
	}
});



module.exports = router;