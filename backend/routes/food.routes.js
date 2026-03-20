const express = require('express');
const router = express.Router();
const foodController = require('../controllers/food.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, foodController.addFood);
router.get('/', foodController.getAvailableFood);
router.get('/all', authMiddleware, foodController.getAllPosts);
router.get('/my-posts', authMiddleware, foodController.getMyPosts);
router.put('/:id/status', authMiddleware, foodController.updateStatus);
router.delete('/:id', authMiddleware, foodController.deleteFood);
router.put('/:id', authMiddleware, foodController.editFood);

module.exports = router;
