const mysql = require("mysql2");

const dbPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_lostandfound",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = dbPool.promise();