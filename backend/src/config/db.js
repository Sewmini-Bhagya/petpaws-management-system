const mysql = require("mysql2/promise");
require('dotenv').config();

/**
 * Initializes and exports a Promise-based MySQL connection pool.
 * Retrieves connection parameters from the environment configuration.
 */
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

module.exports = db;