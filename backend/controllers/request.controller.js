const RequestModel = require('../models/request.model');
const FoodModel = require('../models/food.model');

exports.requestFood = async (req, res) => {
    try {
        if (req.user.role !== 'receiver') {
            return res.status(403).json({ message: 'Only receivers can request food' });
        }

        const { food_id } = req.body;

        const food = await FoodModel.findById(food_id);
        if (!food || food.status !== 'available') {
            return res.status(400).json({ message: 'Food is no longer available' });
        }

        await RequestModel.create(food_id, req.user.id);
        res.status(201).json({ message: 'Request sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const requests = await RequestModel.findByReceiver(req.user.id);
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const requests = await RequestModel.findAll();
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRequestsForMyFood = async (req, res) => {
    try {
        const { food_id } = req.params;
        const food = await FoodModel.findById(food_id);
        if (!food || food.donor_id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const requests = await RequestModel.findByFoodId(food_id);
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { request_id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        const request = await RequestModel.findById(request_id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const food = await FoodModel.findById(request.food_id);
        if (food.donor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await RequestModel.updateStatus(request_id, status);

        if (status === 'approved') {
            await FoodModel.updateStatus(food.id, 'claimed');
            // Auto reject other requests for this food
            // Not implemented for simplicity, but could be added
        }

        res.json({ message: `Request ${status} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
