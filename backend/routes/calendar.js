import express from 'express';
import { syncCalendar, getCalendar, deleteEvent } from '../controllers/carlendarController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/sync', verifyToken, syncCalendar);
router.get('/:user_id', verifyToken, getCalendar);
router.delete('/:event_id', verifyToken, deleteEvent);

export default router;
