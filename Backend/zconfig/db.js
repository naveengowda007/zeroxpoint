const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

// create mysql connection
const connection = mysql.createConnection({
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
});

// connect to database
connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("DB connected successfully");
  }
});

setInterval(() => {
  connection.connect((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("DB connected successfully");
    }
  });
}, 60000 * 60 * 4);

const db = async (...args) => {
  return await new Promise((resolve, reject) =>
    connection.query(...args, (err, results) => {
      if (err) {
        // console.log(err);
        reject(err);
      }
      resolve(results);
    })
  );
};

module.exports = db;
