const Razorpay = require("razorpay");
const dotenv = require("dotenv");
dotenv.config();
const razorpayid = process.env.RAZOR_ID;
const razorsecret = process.env.RAZOR_SECRET;

const razorpay = new Razorpay({
  key_id: razorpayid, // Replace with your Razorpay Key ID
  key_secret: razorsecret, // Replace with your Razorpay Secret
});

// Create an order
const createOrder = async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const options = {
      amount: amount * 100, // Razorpay takes the amount in the smallest currency unit (e.g., paise for INR)
      currency: currency,
      receipt: "order_rcptid_11",
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Something went wrong while creating the order." });
  }
};

module.exports = { createOrder };
