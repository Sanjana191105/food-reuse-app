const mysql = require('mysql2');

const pool = mysql.createPool({
    host: "mysql.railway.internal", // will fix if needed
    user: "root",
    password: "qxBoHKRVxuagPWDwoMQhARmiIbCpjbZv",
    database: "railway",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to MySQL Database.');
        connection.release();
    }
});

module.exports = pool.promise();