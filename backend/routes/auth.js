import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = (supabase) => {
  const r = express.Router();
  r.post('/register', register(supabase));
  r.post('/login', login(supabase));
  r.post('/logout', logout);
  r.get('/me', verifyToken, getMe(supabase));
  return r;
};

export default router;