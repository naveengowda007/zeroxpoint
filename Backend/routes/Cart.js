const express = require("express");
const router = express.Router();
const multer = require("multer");
var fs = require("fs");
const mammoth = require("mammoth");
const pdf = require("pdf-parse");
const XLSX = require("xlsx");
const AdmZip = require("adm-zip");
const xml2js = require("xml2js");
const uploadfile = require("./utils/s3bucket");
const db = require("../zconfig/db");
const { generateUpdateQuery, generateInsertQuery } = require("../zconfig/res");
const { verifyToken } = require("../zconfig/jwt");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { userid } = req.user;
    let { cartid } = req.body;
    if (!cartid) {
      cartid = req.header("cartid");
    }
    let filePath = `uploads/${userid}/${cartid}`;
    fs.mkdirSync(filePath, { recursive: true });
    cb(null, filePath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Upload files
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  if (req.file) {
    await uploadfile(req);
    res.json({ success: true, message: "File Uploaded" });
  } else {
    res.status(400).json({ success: false, message: "File not received" });
  }
});

// get price
router.post("/getPrice", verifyToken, async (req, res) => {
  const { userid, cartid, CartData, PrintingInstructions, DeliveryLocation } =
    req.body;

  let filePath = `uploads/${userid}/${cartid}`;

  const adminSql = `SELECT price_table FROM adminpricetable`;
  let Prices = await db(adminSql);
  Prices = Prices[0];
  if (!Prices) {
    return res.status(500).send({ message: "Invalid prices" });
  }

  Prices = Prices.price_table;
  let totalCost = 0;

  // Add delivery cost
  totalCost += DeliveryLocation.length * Prices.deliveryCharge;

  fs.readdir(filePath, async (err, files) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ message: "Error reading directory" });
    }

    const Cart = CartData;

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      let currentFilePath = `${filePath}/${file}`;

      const itemIndex = Cart.findIndex(
        (item) => item.uri.endsWith(file) || file === item?.name
      );
      if (itemIndex === -1) {
        return res.status(500).send({ message: "Error getting price" });
      }
      let item = Cart[itemIndex];

      let CurPageCost = 0;
      const CurPaperSize = Prices.PaperSizeData.find(
        (CurPapaer) =>
          CurPapaer.name === item.size.name &&
          CurPapaer.paperType.id === item.paper.id
      );

      // Check for Color
      if (item.color === "BW") {
        if (item.sides === "single-side") {
          CurPageCost = parseFloat(CurPaperSize.bwSingleSide);
        } else {
          CurPageCost = parseFloat(CurPaperSize.bwDoubleSide);
        }
      } else {
        if (item.sides === "single-side") {
          CurPageCost = parseFloat(CurPaperSize.colorSingleSide);
        } else {
          CurPageCost = parseFloat(CurPaperSize.colorDoubleSide);
        }
      }

      let bindingCost = Prices.bindingOptions.find(
        (bind) => bind.id === item.binding.id
      ).price;
      bindingCost = parseFloat(bindingCost);
      totalCost += bindingCost * item.copies;

      let fileExtension = file.split(".").pop();
      if (["jpg", "jpeg", "heic", "gif", "png"].includes(fileExtension)) {
        item.pages = 1;

        // Check for Sides
        if (item.pages === 1) {
          item.sides = "single-side";
        }
        if (item.sides === "single-side") {
          totalCost += item.pages * item.copies * CurPageCost;
        } else {
          totalCost += Math.ceil(item.pages / 2) * item.copies * CurPageCost;
        }
      } else if (fileExtension === "pdf") {
        // Extract page count for PDF files using pdf-parse library
        try {
          const dataBuffer = fs.readFileSync(currentFilePath);
          let data = await pdf(dataBuffer);
          const pageCount = data.numpages;
          item.pages = pageCount;
          Cart[itemIndex] = item;

          if (item.pages === 1) {
            item.sides = "single-side";
          }
          if (item.sides === "single-side") {
            totalCost += item.pages * item.copies * CurPageCost;
          } else {
            totalCost += Math.ceil(item.pages / 2) * item.copies * CurPageCost;
          }
        } catch (error) {
          console.log(error);
          return res
            .status(500)
            .send({ message: "Error extracting page count" });
        }
      } else if (["doc", "docx"].includes(fileExtension)) {
        // Extract page count for DOC, DOCX, RTF files using mammoth library
        try {
          const result = await mammoth.extractRawText({
            path: currentFilePath,
          });
          const text = result.value;
          const pageCount = Math.ceil(text.split("\n").length / 80); // assuming 40 lines fit on one A4 sheet
          item.pages = pageCount;
          Cart[itemIndex] = item;

          if (item.pages === 1) {
            item.sides = "single-side";
          }
          if (item.sides === "single-side") {
            totalCost += item.pages * item.copies * CurPageCost;
          } else {
            totalCost += Math.ceil(item.pages / 2) * item.copies * CurPageCost;
          }
        } catch (error) {
          console.log(error);
          return res
            .status(500)
            .send({ message: "Error extracting page count" });
        }
      } else if (["txt", "csv"].includes(fileExtension)) {
        try {
          const text = fs.readFileSync(currentFilePath, "utf8");
          const linesPerPage = 52;
          const lines = text.split("\n").length;
          const pageCount = Math.ceil(lines / linesPerPage);

          item.pages = pageCount;
          Cart[itemIndex] = item;

          if (item.pages === 1) {
            item.sides = "single-side";
          }
          if (item.sides === "single-side") {
            totalCost += item.pages * item.copies * CurPageCost;
          } else {
            totalCost += Math.ceil(item.pages / 2) * item.copies * CurPageCost;
          }
        } catch (error) {
          console.log(error);
          return res
            .status(500)
            .send({ message: "Error estimating page count" });
        }
      } else if (["ppt", "pptx"].includes(fileExtension)) {
        // Extract the contents of the PPT file
        const zip = new AdmZip(currentFilePath);
        const appXmlEntry = zip.getEntry("docProps/app.xml");

        if (!appXmlEntry) {
          return res
            .status(500)
            .send({ message: "Error extracting page count" });
        }

        // Read the app.xml file and parse the XML content
        const appXmlContent = appXmlEntry.getData().toString();
        const parser = new xml2js.Parser();
        const parsedXml = await parser.parseStringPromise(appXmlContent);

        // Extract the number of slides from the parsed XML
        const slides = parseInt(parsedXml.Properties.Slides[0], 10);
        item.pages = slides;
        Cart[itemIndex] = item;

        if (item.pages === 1) {
          item.sides = "single-side";
        }
        if (item.sides === "single-side") {
          totalCost += item.pages * item.copies * CurPageCost;
        } else {
          totalCost += Math.ceil(item.pages / 2) * item.copies * CurPageCost;
        }
      } else if (["xls", "xlsx"].includes(fileExtension)) {
        // Read the Excel file
        const workbook = XLSX.readFile(currentFilePath);
        const sheetNameList = workbook.SheetNames;

        // Get the first sheet in the workbook
        const worksheet = workbook.Sheets[sheetNameList[0]];

        // Get the range of the sheet and decode it to get the number of rows
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        const numberOfRows = range.e.r + 1;

        const pageCount = Math.ceil(numberOfRows / 55);
        item.pages = pageCount;
        Cart[itemIndex] = item;

        if (item.pages === 1) {
          item.sides = "single-side";
        }
        if (item.sides === "single-side") {
          totalCost += item.pages * item.copies * CurPageCost;
        } else {
          totalCost += Math.ceil(item.pages / 2) * item.copies * CurPageCost;
        }
      }
    }

    try {
      let order_details = {
        cartid,
        cart: Cart,
        totalCost,
        PrintingInstructions,
        DeliveryLocation,
        DeliveryCharge: Prices.deliveryCharge,
      };

      // Keep same keys as of dbTypes
      let data = {
        userid,
        cartid,
        order_details: JSON.stringify(order_details),
      };

      const sql = await generateInsertQuery("cart", data);
      let result = await db(sql.sql, sql.fields);
      if (result.affectedRows === 0) {
        return res.status(500).send({ message: "Error getting price" });
      }

      // Send the cart and price details
      res.send(order_details);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Error getting price" });
    }
  });
});

module.exports = router;
