const db = require('../config/db');

class FoodModel {
    static async create(donor_id, name, quantity, location, expiry_time, image_url) {
        const query = `INSERT INTO FoodPosts (donor_id, name, quantity, location, expiry_time, image_url) VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(query, [donor_id, name, quantity, location, expiry_time, image_url]);
        return result;
    }

    static async findAllAvailable() {
        // Automatically mark as expired if past expiry_time before returning
        await db.query(`UPDATE FoodPosts SET status = 'expired' WHERE expiry_time < NOW() AND status = 'available'`);
        
        const query = `
            SELECT f.*, u.name as donor_name 
            FROM FoodPosts f 
            JOIN Users u ON f.donor_id = u.id 
            WHERE f.status = 'available' 
            ORDER BY f.expiry_time ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    static async findByDonor(donor_id) {
        // Update expired status first
        await db.query(`UPDATE FoodPosts SET status = 'expired' WHERE expiry_time < NOW() AND status = 'available'`);

        const query = `SELECT * FROM FoodPosts WHERE donor_id = ? ORDER BY created_at DESC`;
        const [rows] = await db.query(query, [donor_id]);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM FoodPosts WHERE id = ?`;
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }

    static async findAll() {
        // Update expired status first to keep admin view accurate
        await db.query(`UPDATE FoodPosts SET status = 'expired' WHERE expiry_time < NOW() AND status = 'available'`);

        const query = `
            SELECT f.*, u.name as donor_name, u.email as donor_email
            FROM FoodPosts f 
            JOIN Users u ON f.donor_id = u.id 
            ORDER BY f.created_at DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    static async updateStatus(id, status) {
        const query = `UPDATE FoodPosts SET status = ? WHERE id = ?`;
        const [result] = await db.query(query, [status, id]);
        return result;
    }

    static async delete(id) {
        const query = `DELETE FROM FoodPosts WHERE id = ?`;
        const [result] = await db.query(query, [id]);
        return result;
    }

    static async updateFull(id, name, quantity, location, expiry_time, image_url) {
        const query = `UPDATE FoodPosts SET name=?, quantity=?, location=?, expiry_time=?, image_url=?, status='available' WHERE id=?`;
        const [result] = await db.query(query, [name, quantity, location, expiry_time, image_url, id]);
        return result;
    }
}

module.exports = FoodModel;
