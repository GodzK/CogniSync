import express from 'express';
import { createFeedback, getFeedback, getFeedbackById } from '../controllers/feedbackController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createFeedback);
router.get('/', verifyToken, getFeedback);
router.get('/:id', verifyToken, getFeedbackById);

export default router;