const db = require('../config/db');

class RequestModel {
    static async create(food_id, receiver_id) {
        const query = `INSERT INTO Requests (food_id, receiver_id) VALUES (?, ?)`;
        const [result] = await db.query(query, [food_id, receiver_id]);
        return result;
    }

    static async findByReceiver(receiver_id) {
        const query = `
            SELECT r.*, f.name as food_name, f.location, f.status as food_status 
            FROM Requests r
            JOIN FoodPosts f ON r.food_id = f.id
            WHERE r.receiver_id = ?
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.query(query, [receiver_id]);
        return rows;
    }

    static async findByFoodId(food_id) {
        const query = `
            SELECT r.*, u.name as receiver_name, u.email as receiver_email
            FROM Requests r
            JOIN Users u ON r.receiver_id = u.id
            WHERE r.food_id = ?
        `;
        const [rows] = await db.query(query, [food_id]);
        return rows;
    }

    static async updateStatus(id, status) {
        const query = `UPDATE Requests SET status = ? WHERE id = ?`;
        const [result] = await db.query(query, [status, id]);
        return result;
    }

    static async findAll() {
        const query = `
            SELECT r.*, f.name as food_name, f.location, f.status as food_status, u.name as receiver_name, u.email as receiver_email
            FROM Requests r
            JOIN FoodPosts f ON r.food_id = f.id
            JOIN Users u ON r.receiver_id = u.id
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM Requests WHERE id = ?`;
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }
}

module.exports = RequestModel;
