const db = require('../config/db');

class UserModel {
    static async create(name, email, hashedPassword, role) {
        const query = `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`;
        const [result] = await db.query(query, [name, email, hashedPassword, role]);
        return result;
    }

    static async findByEmail(email) {
        const query = `SELECT * FROM Users WHERE email = ?`;
        const [rows] = await db.query(query, [email]);
        return rows[0];
    }

    static async findById(id) {
        const query = `SELECT id, name, email, role, created_at FROM Users WHERE id = ?`;
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }

    static async findAll() {
        const query = `SELECT id, name, email, role, created_at FROM Users ORDER BY created_at DESC`;
        const [rows] = await db.query(query);
        return rows;
    }

    static async delete(id) {
        const query = `DELETE FROM Users WHERE id = ?`;
        const [result] = await db.query(query, [id]);
        return result;
    }
}

module.exports = UserModel;
