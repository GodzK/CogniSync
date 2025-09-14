import express from 'express';
import { getUser, updateUser, getAnalytics } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = (supabase) => {
  const r = express.Router();
  r.get('/:user_id', verifyToken, getUser(supabase));
  r.patch('/:user_id', verifyToken, updateUser(supabase));
  r.get('/:user_id/analytics', verifyToken, getAnalytics(supabase));
  return r;
};

export default router;