const mysql = require('mysql2');

const pool = mysql.createPool({
    host: "ballast.proxy.rlwy.net",   // from your Railway
    user: "root",
    password: "qxBoHKRVxuagPWDwoMQhARmiIbCPjbZv", // your password
    database: "railway",
    port: 55703,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to MySQL Database");
        connection.release();
    }
});

module.exports = pool.promise();