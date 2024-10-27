const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const db = require("../zconfig/db");
const { generateUpdateQuery, generateInsertQuery } = require("../zconfig/res");
const { verifyToken } = require("../zconfig/jwt");
const messageTrigger = require("./utils/whatsappmessage");
// Place order from application
router.post("/", verifyToken, async (req, res) => {
  const { userid, cartid, DeliveryLocation } = req.body;
  //  getCdnUrl(req.user.userid, cart[0].cartid);
  const cartSql = "SELECT * FROM cart WHERE cartid = ?";
  const cartResult = (await db(cartSql, [cartid]))[0];
  console.log(cartResult);

  const delivery_location = JSON.stringify(DeliveryLocation);

  try {
    let data = {
      userid,
      cartid,
      delivery_location,
    };

    const sql = await generateInsertQuery("orders", data);
    let result = await db(sql.sql, sql.fields);
    if (result.affectedRows === 0) {
      return res.status(500).send({ message: "Order Failed" });
    }
    await sendDocumentsonWhatsapp(userid, cartid);
    // Send the cart and price details
    res.json({ message: "Order Placed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Order Failed" });
  }
});

// Get order list
router.post("/fetch", verifyToken, async (req, res) => {
  try {
    const sql = `SELECT * FROM orders WHERE userid = ? ORDER BY id DESC`;
    let result = await db(sql, [req.user.userid]);

    // Map result array to extract additional data
    const FinalData = await Promise.all(
      result.map(async (order) => {
        const cartSql = "SELECT * FROM cart WHERE cartid = ?";
        const cart = (await db(cartSql, [order.cartid]))[0];
        // console.log(cart);

        const shops = await getShopFromId(order.shop_id);

        return {
          ...order,
          shops,
          cart,
        };
      })
    );

    res.json(FinalData);
  } catch (error) {
    console.log(error);
    res.send({ message: "Failed to get orders" });
  }
});

// Get shop details from shop id
async function getShopFromId(shops) {
  const shopsList = [];

  for (let index = 0; index < shops.length; index++) {
    const shopId = shops[index];
    const sql = `SELECT id, phone, shop_name, address_text, latitude, longitude FROM shops WHERE id = ?`;
    shopsList.push((await db(sql, [shopId]))[0]);
  }

  return shopsList;
}

const getCdnUrl = async (userId, cartId) => {};

const sendDocumentsonWhatsapp = async (userId, cartId) => {
  const bucketUrl = `https://zerox-point-bucket.s3.amazonaws.com`;
  const folderPath = `uploads/${userId}/${cartId}`; // Replace with your folder path

  fs.readdir(folderPath, async (err, files) => {
    if (err) {
      return console.error("Error reading directory:", err);
    }

    // Filter the files if you only want certain types (optional)
    const fileNames = files.filter((file) =>
      fs.statSync(path.join(folderPath, file)).isFile()
    );
    console.log(fileNames, `${bucketUrl}/${fileNames[0].split(".")[0]}`);
    for (var i = 0; i < fileNames.length; i++) {
      const data = {
        var1: cartId,
        var2: `${bucketUrl}/${fileNames[0].split(".")[0]}`,
        templateName: "document_link_to_print",
        language: "en",
      };
      console.log(data);
      await messageTrigger("919933683560", data);
    }
    console.log("Files in the folder:", fileNames);
  });
};

module.exports = router;
