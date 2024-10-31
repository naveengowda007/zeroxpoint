var express = require('express');
var router = express.Router();
const db = require('../zconfig/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { generateInsertQuery, generateUpdateQuery } = require('../zconfig/res');
const { verifyAdminToken, verifyToken } = require('../zconfig/jwt');
const CONFIG = require('../zconfig/CONFIG');

// Constants
const { saltRounds, RowsPerPage, defaultPass } = CONFIG

// Update vendor payment details
router.post('/updateVendorPayment', verifyToken, (req, res) => {
	const data = req.body
	updatePayment(data.userid, req, res)
})


// Send vendors list
router.post('/getVendors', verifyAdminToken, async (req, res) => {
	const { page } = req.query;
	let offset = 0
	if (page) {
		offset = (page - 1) * RowsPerPage;
	}
	const vendors = await db(`SELECT userid, shop_name as name, phone, email, is_deleted, created_at FROM shops ORDER BY created_at DESC LIMIT ${RowsPerPage} OFFSET ${offset}`);
	const count = await db(`SELECT COUNT(*) FROM shops`);
	const totalPages = Math.ceil(count[0]['COUNT(*)'] / RowsPerPage);
	res.send({ vendors, totalPages });
})

// Send vendor data
router.post('/getVendor/:uid', verifyAdminToken, async (req, res) => {
	const { uid } = req.params

	const vendor = await db(`SELECT vendor_name as name, phone, email, shop_name, address_text, latitude, longitude, default_payment_id, default_priceTable_id, is_deleted, created_at FROM shops WHERE userid = ?`, [uid]);
	if (vendor.length === 0)
		return res.status(403).send({ message: 'Something went wrong' })

	let result = vendor[0]
	const paymentSql = await db(`SELECT * FROM payment_info WHERE id = ?`, [result.default_payment_id]);
	if (paymentSql[0]) {
		result.paymentInfo = paymentSql[0]
	}

	const priceSql = await db(`SELECT price_table FROM vendorpricetable WHERE id = ?`, [result.default_priceTable_id]);
	if (priceSql[0]) {
		result.price_table = priceSql[0].price_table
	}

	return res.send(result);
});


// Send my vendor
router.post('/getMyVendor', verifyToken, async (req, res) => {
	const vendor = await db(`SELECT vendor_name as name, phone, email, shop_name, address_text, latitude, longitude, default_payment_id FROM shops WHERE userid = ?`, [req.user.userid]);
	if (!vendor) return res.status(401).send({ message: 'Something went wrong' })

	let result = vendor[0]
	const paymentSql = await db(`SELECT * FROM payment_info WHERE id = ?`, [result?.default_payment_id]);
	if (paymentSql[0]) {
		result.paymentInfo = paymentSql[0]
	}

	return res.send(result);
})


// Add vendor
router.post('/addVendor', async (req, res) => {
	try {
		const data = req.body
		const email = data.email.toLowerCase().trim()

		let searchUserSql = `SELECT * FROM shops WHERE email = ?`;
		let searchResult = await db(searchUserSql, email)
		searchResult = searchResult[0]
		if (searchResult) return res.status(500).send({ message: 'Account already exists' })

		const userid = crypto.randomUUID()

		const hashedPassword = bcrypt.hashSync(defaultPass, saltRounds);
		let userData = {
			userid,
			email,
			"vendor_name": data.name,
			"phone": data.phoneNumber,
			"password": hashedPassword,
			"shop_name": data.shopName,
			"address_text": data.address,
			"latitude": data.lat,
			"longitude": data.lng,
		}

		const sql = await generateInsertQuery('shops', userData)
		let result = await db(sql.sql, sql.fields)

		if (result.affectedRows === 0) {
			return res.status(500).send({ message: 'Error Creating Shop' })
		}

		updatePayment(userid, req, res)
	} catch (error) {
		console.log(error);
		
		res.status(500).send({ message: 'Error Creating Shop' })
	}
})


// **********************************
// payment update function
const updatePayment = async (userid, req, res) => {
	try {
		const data = req.body

		// Add payment information
		const paymentInfo = { userid, payment_type: data.bankOption }
		let payment_data = {
			paymentFrequency: data.paymentFrequency
		}

		if (data.bankOption === 'upi') {
			payment_data.upiId = data.upiId
		}
		else if (data.bankOption === 'account') {
			payment_data.accountHolderName = data.accountHolderName
			payment_data.accountNumber = data.accountNumber
			payment_data.ifscCode = data.ifscCode
		}
		else return res.status(500).send({ message: 'Error Creating Shop' })


		paymentInfo.payment_data = JSON.stringify(payment_data)

		const paysql = await generateInsertQuery('payment_info', paymentInfo)
		let payresult = await db(paysql.sql, paysql.fields)

		if (payresult.affectedRows === 0) {
			return res.status(500).send({ message: 'Error Creating Shop' })
		}

		const updateSql = await generateUpdateQuery('shops', { userid, default_payment_id: payresult.insertId }, "userid")
		const updateresult = await db(updateSql.sql, updateSql.fields);
		if (updateresult.affectedRows === 0) {
			return res.status(500).send({ message: 'Error Creating Shop' })
		}

		res.send({ message: 'success' })
	} catch (error) {
		res.status(500).send({ message: 'Error Creating Shop' })
	}
}


module.exports = router;