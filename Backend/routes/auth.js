var express = require("express");
var router = express.Router();
const db = require("../zconfig/db");
const crypto = require("crypto");
var request = require("request");

var { createToken, verifyToken } = require("../zconfig/jwt");
const { generateInsertQuery, generateUpdateQuery } = require("../zconfig/res");
const { sendFast2OTP, VerifyFast2OTP } = require("./utils/fast2sms");

let OTPAuthToken = "";

async function getToken(number) {
  var options = {
    method: "GET",
    url: "https://cpaas.messagecentral.com/auth/v1/authentication/token?country=IN&email=xeroxpoint766@gmail.com&customerId=C-794E4CB7DE7C443&key=U2hpdnVANzY2&scope=NEW",
    headers: { accept: "*/*" },
  };

  request(options, function (error, response) {
    if (error) console.log(error);
    else {
      const res = JSON.parse(response.body);
      // console.log(res);
      OTPAuthToken = res?.token;
    }
  });
}

getToken();
setInterval(() => {
  getToken();
}, 1000 * 60 * 60 * 24 * 6);

// Create a new user
router.post("/register", async (req, res) => {
  const { phone, email, type } = req.body;
  if (!type) {
    return res.status(403).send({ message: "Invalid Type" });
  }

  // Phone and OTP registration
  if (type == "phone") {
    try {
      if (phone.length !== 10) {
        return res.status(403).send({ message: "Invalid Phone Number" });
      }

      const searchUserSql = `SELECT * FROM users WHERE phone = ? AND is_deleted = 0`;
      let searchResult = await db(searchUserSql, phone);
      searchResult = searchResult[0];
      if (searchResult) {
        if (searchResult.is_deleted) {
          return res.status(500).send({ message: "User Deleted" });
        } else {
          // Adding Demo user
          if (phone === "9999999999") {
            sendOTP(searchResult, true);
            return res.send({ otp: true });
          }

          sendOTP(searchResult);
          return res.send({ otp: true });
        }
      }

      const userid = crypto.randomUUID();
      let userData = {
        userid,
        phone,
      };
      const sql = await generateInsertQuery("users", userData);
      let result = await db(sql.sql, sql.fields);
      if (result.affectedRows === 0) {
        return res.send({ otp: false });
      }

      if (phone === "9999999999") {
        sendOTP(userData, true);
        return res.send({ otp: true });
      }

      sendOTP(userData);
      res.send({ otp: true });
    } catch (error) {
      res.status(500).send({ message: "Error generating OTP" });
    }
  }
});

// Verify user
router.post("/verify", async (req, res) => {
  const { phone, otp, email, password, type } = req.body;

  if (!type) {
    return res.status(403).send({ message: "Invalid Type" });
  }

  if (type === "phone") {
    const useridSql = `SELECT * FROM users WHERE phone = ?`;
    let result = await db(useridSql, [phone]);
    result = result[0];

    const otpSql = `SELECT * FROM otp WHERE userid = ?`;
    result = await db(otpSql, [result.userid]);
    result = result[0];

    if (!result || result.is_deleted) {
      return res.status(403).send({ message: "OTP invalid" });
    }

    if (phone === "9999999999") {
      let userData = {
        userid: result.userid,
      };
      let jwt = createToken(userData);
      return res.send({ ...userData, jwt, type: "user" });
    }

    const verifiedUser = new Promise((resolve, reject) => {
      VerifyFast2OTP(resolve, reject, phone, result.otp, otp, OTPAuthToken);
    });

    verifiedUser.then((value) => {
      if (value) {
        let userData = {
          userid: result.userid,
        };
        let jwt = createToken(userData);
        return res.send({ ...userData, jwt, type: "user" });
      }
      return res.status(403).send({ message: "OTP invalid" });
    });
  }
});

//forgetpassword
router.post("/forgetpassword", async (req, res) => {
  const { phone } = req.body;
  //finding if a registered user
  const useridSql = `SELECT * FROM users WHERE phone = ?`;
  let result = await db(useridSql, [phone]);
  result = result[0];
  if (!result) {
    res.status(403).send({ message: "User not registered" });
  } else {
    let userid = result.userid;
    let userData = {
      userid,
      phone,
    };
    console.log(userData);
    sendOTP(userData);
    res.send({ message: "OTP sent" });
  }
});

//update password

router.post("/updatepassword", async (req, res) => {
  const { phone, password } = req.body;
  const data = { password: password };
  await generateUpdateQuery("users", data, phone);
  res.status(201).send({ message: "Password updated" });
});

//
//
//
//
// Supported Functions
//
//
//

async function sendOTP(res, isDemo = false) {
  let userid = res.userid;

  // Delete existing OTP
  const deleteSql = "DELETE FROM otp WHERE userid = ?";
  await db(deleteSql, [userid]);

  // Add new OTP
  if (isDemo) {
    let data = { userid, otp: "1111" };
    // const sql = await generateInsertQuery("otp", data);
    await db(sql.sql, sql.fields);
    return;
  }

  const vid = new Promise((resolve, reject) => {
    if (!OTPAuthToken) {
      return;
    }
    sendFast2OTP(resolve, reject, res.phone, OTPAuthToken);
  });

  vid.then(async (value) => {
    if (value) {
      let data = { userid, otp: value };
      const sql = await generateInsertQuery("otp", data);
      await db(sql.sql, sql.fields);
    }
  });
}

module.exports = router;
