const mysql = require("mysql");
require("dotenv").config();

const databaseConfig = {
  host: process.env.MYSQL_DB_HOST,
  user: process.env.MYSQL_DB_USER,
  password: process.env.MYSQL_DB_PASS,
  database: process.env.MYSQL_DB_NAME,
  port: process.env.MYSQL_DB_PORT,
};

const database = (callback) => {
  const dbConnection = mysql.createConnection(databaseConfig);
  dbConnection.connect(function (err) {
    if (err) {
      console.log(err);
    } else {
      callback(dbConnection);
    }
  });
};

module.exports = database;
