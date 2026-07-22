const { Pool } = require("pg");
require("dotenv").config();

const db = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.on("connect", () => {
    console.log("Connected to PostgreSQL");
});

db.on("error", (err) => {
    console.error("PostgreSQL Error:", err);
});

module.exports = db;