const FoodModel = require('../models/food.model');

exports.addFood = async (req, res) => {
    try {
        if (req.user.role !== 'donor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only donors can post food' });
        }

        const { name, quantity, location, expiry_time, image_url } = req.body;
        
        await FoodModel.create(req.user.id, name, quantity, location, expiry_time, image_url);
        res.status(201).json({ message: 'Food posted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAvailableFood = async (req, res) => {
    try {
        const foodList = await FoodModel.findAllAvailable();
        res.json(foodList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const posts = await FoodModel.findAll();
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyPosts = async (req, res) => {
    try {
        const posts = await FoodModel.findByDonor(req.user.id);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const post = await FoodModel.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        if (post.donor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await FoodModel.updateStatus(id, status);
        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await FoodModel.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        if (post.donor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await FoodModel.delete(id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.editFood = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, quantity, location, expiry_time, image_url } = req.body;
        
        const post = await FoodModel.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        if (post.donor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await FoodModel.updateFull(id, name, quantity, location, expiry_time, image_url);
        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
