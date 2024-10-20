const db = require('../zconfig/db');
const jwt = require('jsonwebtoken');

const secretKey = 'For#ZeroxPoint';

// Current Admin userid
AdminUseridList = []

async function FetchAdminId() {
	const isAdmin = await db(`SELECT userid FROM admin`);
	isAdmin?.forEach(element => {
		AdminUseridList.push(element.userid)
	});
}

FetchAdminId()


// ****************************************************************

const createToken = (payload) => {
	return jwt.sign(payload, secretKey, { expiresIn: '365d' });
}

// Define a middleware to verify the token
const verifyToken = (req, res, next) => {
	const token = req.header('jwt')
	if (!token) {
		return res.status(401).json({ message: 'Token is missing' });
	}

	try {
		// Verify the token
		const decoded = jwt.verify(token, secretKey);
		req.user = decoded;

		// Userid error log
		if (!req.body.userid) {
			const userid = req.header('userid')
			if (req.user.userid !== userid) {
				return res.status(403).send({ message: 'Invalid userid' })
			}
		}
		else if (req.user.userid !== req.body.userid) {
			return res.status(403).send({ message: 'Invalid userid' })
		}
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
};

// Define a middleware to verify the admin token
const verifyAdminToken = (req, res, next) => {
	const token = req.header('jwt')
	if (!token) {
		return res.status(401).json({ message: 'Token is missing' });
	}

	try {
		// Verify the token
		const decoded = jwt.verify(token, secretKey);
		req.user = decoded;

		// Userid error log
		if (!req.body.userid) {
			const userid = req.header('userid')
			if (req.user.userid !== userid) {
				return res.status(403).send({ message: 'Invalid userid' })
			}
		}
		else if (req.user.userid !== req.body.userid) {
			return res.status(403).send({ message: 'Invalid userid' })
		}

		if (!AdminUseridList.includes(req.user.userid)) {
			return res.status(403).send({ message: 'Invalid userid' })
		}

		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
};

const checkIfAdmin = (req) => AdminUseridList.includes(req.user.userid)


module.exports = { FetchAdminId, createToken, verifyToken, verifyAdminToken, checkIfAdmin }