const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, requestController.requestFood);
router.get('/my-requests', authMiddleware, requestController.getMyRequests);
router.get('/all', authMiddleware, requestController.getAllRequests);
router.get('/food/:food_id', authMiddleware, requestController.getRequestsForMyFood);
router.put('/:request_id/status', authMiddleware, requestController.updateRequestStatus);

module.exports = router;
