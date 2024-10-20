const mysql = require("mysql2");

// create mysql connection
const connection = mysql.createConnection({
  host: "db",
  user: "root",
  password: "my-secret-pw",
  database: "zeroxpoint",
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
