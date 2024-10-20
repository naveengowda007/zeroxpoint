var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

// Custom routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profileAPI");
const locationRouter = require("./routes/location");
const PricesRouter = require("./routes/Prices");
const CartRouter = require("./routes/Cart");
const OrdersRouter = require("./routes/Orders");

// Admin routes
const adminAuth = require("./routes_admin/admin-auth");
const adminDashboard = require("./routes_admin/dashboard");
const adminUsers = require("./routes_admin/admin-users");
const adminOrders = require("./routes_admin/admin-orders");
const adminVendors = require("./routes_admin/admin-vendors");
const priceHandler = require("./routes_admin/priceHandler");

// Initialize the app
const app = express();
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

// Custom routes
// app.get("/", (req, res) => {
// 	res.status(301).redirect("https://zeroxpoint.com/admin/?#/auth")
// })

app.use(express.static(process.cwd() + "/Website/build/"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/Website/dist/index.html");
});

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/location", locationRouter);
app.use("/prices", PricesRouter);
app.use("/cart", CartRouter);
app.use("/order", OrdersRouter);

// Admin routes

app.use("/adminapi", adminAuth);
app.use("/adminapi", adminDashboard);
app.use("/adminapi", adminOrders);
app.use("/adminapi", adminUsers);
app.use("/adminapi", adminVendors);
app.use("/adminapi", priceHandler);

// Extras

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
