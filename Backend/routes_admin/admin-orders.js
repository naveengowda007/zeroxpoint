var express = require("express");
var router = express.Router();
var fs = require("fs");
const archiver = require("archiver");
const db = require("../zconfig/db");

const {
  generateInsertQuery,
  differenceInDays,
  generateUpdateQuery,
} = require("../zconfig/res");
const {
  verifyToken,
  verifyAdminToken,
  checkIfAdmin,
} = require("../zconfig/jwt");
const CONFIG = require("../zconfig/CONFIG");

// Constants
const { RowsPerPage } = CONFIG;

// Order details
router.post("/getOrder/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  const order = (await db(`SELECT * FROM orders WHERE id = ?`, [id]))[0];
  if (!order) return res.status(403).send({ message: "Something went wrong" });

  let { userid, cartid, shop_id, created_at } = order;

  const user = (
    await db(`SELECT name, phone, email FROM users WHERE userid = ?`, [userid])
  )[0];

  let shop = [];
  for (let index = 0; index < shop_id.length; index++) {
    let id = parseInt(shop_id[index]);
    if (!(id >= 0)) {
      shop.push(id);
      continue;
    }

    let curShop = await db(
      `SELECT id, phone, shop_name, address_text, latitude, longitude FROM shops WHERE id = ?`,
      [id]
    );
    curShop = curShop[0];
    shop.push(curShop);
  }

  const cart = (await db("SELECT * FROM cart WHERE cartid = ?", [cartid]))[0];

  const Order = {
    ...order,
    user,
    shop,
    cart,
    filesCount: 0,
  };

  if (
    differenceInDays(created_at) > 2 ||
    (Order.status.length > 0 &&
      Order.status.every((val) => val === "delivered"))
  ) {
    return res.send(Order);
  }

  Order.filesCount = cart.order_details.cart.length;
  res.send(Order);
});

// Send orders list
router.post("/getOrders", verifyAdminToken, async (req, res) => {
  const { page } = req.query;
  let offset = 0;
  if (page) {
    offset = (page - 1) * RowsPerPage;
  }

  try {
    const Orders = [];
    const orders = await db(
      `SELECT * FROM orders ORDER BY id DESC LIMIT ${RowsPerPage} OFFSET ${offset}`
    );

    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      let { userid, shop_id } = order;

      let user = await db(`SELECT userid, name FROM users WHERE userid = ?`, [
        userid,
      ]);
      user = user[0];

      // Get shop information
      let shop = [];
      for (let index = 0; index < shop_id.length; index++) {
        const id = shop_id[index];
        let curShop = (
          await db(`SELECT shop_name FROM shops WHERE id = ?`, [id])
        )[0];
        shop.push(curShop);
      }

      Orders.push({
        ...order,
        user,
        shop,
      });
    }

    // console.log(Orders);
    const count = await db(`SELECT COUNT(*) FROM orders`);
    const totalPages = Math.ceil(count[0]["COUNT(*)"] / RowsPerPage);
    res.send({ orders: Orders, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Send orders for vendor
router.post("/getOrders4Vendor", verifyToken, async (req, res) => {
  const { page } = req.query;
  const user = req.user;

  let offset = 0;
  if (page) {
    offset = (page - 1) * RowsPerPage;
  }

  try {
    const orders = await db(
      `SELECT id, cartid, created_at, shop_id, order_details, status FROM orders WHERE JSON_CONTAINS(shop_id, '?') ORDER BY id DESC LIMIT ${RowsPerPage} OFFSET ${offset}`,
      [user.id]
    );

    for (let index = 0; index < orders.length; index++) {
      const order = orders[index];
      const cart = (
        await db("SELECT * FROM cart WHERE cartid = ?", [order.cartid])
      )[0];
      order.filesCount = cart?.order_details?.cart?.length;
    }

    // console.log(orders);
    const count = await db(
      `SELECT COUNT(*) FROM orders WHERE JSON_CONTAINS(shop_id, '?')`,
      [user.id]
    );
    const totalPages = Math.ceil(count[0]["COUNT(*)"] / RowsPerPage);
    res.send({ orders, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/downloadCart/:id", verifyToken, async (req, res) => {
  const { id: downloadId } = req.params;
  const order = (
    await db(`SELECT * FROM orders WHERE id = ?`, [downloadId])
  )[0];
  if (!order) return res.status(403).send({ message: "Something went wrong" });

  let { userid, cartid, shop_id } = order;

  let shop = [];
  for (let index = 0; index < shop_id.length; index++) {
    const id = shop_id[index];
    let curShop = await db(
      `SELECT id, userid, phone, shop_name, address_text, latitude, longitude FROM shops WHERE id = ?`,
      [id]
    );
    curShop = curShop[0];
    shop.push(curShop);
  }

  if (!(shop.some((val) => shop_id.includes(val.id)) || checkIfAdmin(req)))
    return res.status(401).send({ message: "Something went wrong" });

  const outputName = `ZP0${downloadId}.zip`;
  let folderPath = `uploads/${userid}/${cartid}`;
  const zipFilePath = `uploads/${outputName}`;

  zipFolder(folderPath, zipFilePath)
    .then(() => {
      res.send({
        link: `https://zeroxpoint.com/adminapi/downloadZip/${outputName}`,
      });
    })
    .catch((err) => {
      console.error("Error while zipping folder:", err);
      res.status(500).send({ message: "Internal Server Error" });
    });
});

router.get("/downloadZip/:file", (req, res) => {
  const { file: outputName } = req.params;
  const zipFilePath = `uploads/${outputName}`;

  res.download(zipFilePath, outputName, (err) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      // On Success, delete the zip file after download
      fs.unlinkSync(zipFilePath);
    }
  });
});

// Send vendors list for Assign shop to orders
router.post("/getShops4Order", verifyAdminToken, async (req, res) => {
  const vendors = await db(
    `SELECT id, vendor_name as name, phone, email, shop_name, address_text, latitude, longitude, default_payment_id FROM shops WHERE is_deleted = 0 `,
    [req.user.userid]
  );

  return res.send(vendors);
});

// Add shop to order
router.post("/addShopToOrder", verifyAdminToken, async (req, res) => {
  const { Orderid, CurSelectedLoc, SelectedShop } = req.body;
  const order = (await db(`SELECT * FROM orders WHERE id = ?`, [Orderid]))[0];
  if (!order) return res.status(500).send({ message: "No orders found" });

  let shop_id = order.shop_id;
  shop_id[CurSelectedLoc] = SelectedShop;
  shop_id = JSON.stringify(shop_id);

  let status = order.status;
  status[CurSelectedLoc] = null;
  status = JSON.stringify(status);

  const updateSql = await generateUpdateQuery(
    "orders",
    { shop_id, status, id: order.id },
    "id"
  );
  const result = await db(updateSql.sql, updateSql.fields);

  if (result.affectedRows === 0) {
    return res.status(500).json({ message: "Could not assign shop" });
  }

  return res.send({ message: "Shop assigned successfully" });
});

// Mark an order as delivered
router.post("/deliverOrder", verifyAdminToken, async (req, res) => {
  const { Orderid, CurDeliveryIndex } = req.body;
  const order = (await db(`SELECT * FROM orders WHERE id = ?`, [Orderid]))[0];
  if (!order) return res.status(500).send({ message: "No orders found" });

  let status = order.status;
  status[CurDeliveryIndex] = "delivered";
  status = JSON.stringify(status);

  const updateSql = await generateUpdateQuery(
    "orders",
    { status, id: order.id },
    "id"
  );
  const result = await db(updateSql.sql, updateSql.fields);

  if (result.affectedRows === 0) {
    return res.status(500).json({ message: "Could mark as delivered" });
  }

  return res.send({ message: "Order marked as delivered" });
});

// Change order status
router.post("/orderStatus", verifyToken, async (req, res) => {
  const { Orderid, CurDeliveryIndex, CurStatus } = req.body;
  const order = (await db(`SELECT * FROM orders WHERE id = ?`, [Orderid]))[0];
  if (!order) return res.status(500).send({ message: "No orders found" });

  let status = order.status;
  status[CurDeliveryIndex] = CurStatus;
  status = JSON.stringify(status);

  const updateSql = await generateUpdateQuery(
    "orders",
    { status, id: order.id },
    "id"
  );
  const result = await db(updateSql.sql, updateSql.fields);

  if (result.affectedRows === 0) {
    return res.status(500).json({ message: "Could mark as delivered" });
  }

  return res.send({ message: "Order status changed" });
});

router.post("/cancelOrder", verifyAdminToken, async (req, res) => {
  const { id } = req.body;

  const order = (await db(`SELECT * FROM orders WHERE id = ?`, [id]))[0];
  if (!order) return res.status(500).send({ message: "No orders found" });

  if (
    order.status.length > 0 &&
    order.status.every((item) => item === "delivered")
  ) {
    return res.status(500).send({ message: "Could not cancel order" });
  }

  let order_details = order.order_details;
  order_details.isCancelled = true;
  order_details = JSON.stringify(order_details);

  const updateSql = await generateUpdateQuery(
    "orders",
    { order_details, id },
    "id"
  );
  const result = await db(updateSql.sql, updateSql.fields);

  if (result.affectedRows === 0) {
    return res.status(500).json({ message: "Could not cancel order" });
  }

  return res.send({ message: "Order cancelled successfully" });
});

//
//
// ZIP function
//
//
function zipFolder(folderPath, zipFilePath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip");

    archive.on("error", reject);
    output.on("close", resolve);

    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
  });
}

module.exports = router;
