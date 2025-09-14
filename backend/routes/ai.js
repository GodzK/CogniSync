import express from 'express';
import { suggestTaskOrder, sensoryAlert } from '../controllers/aiController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/suggest_task_order', verifyToken, suggestTaskOrder);
router.post('/sensory_alert', verifyToken, sensoryAlert);

export default router;