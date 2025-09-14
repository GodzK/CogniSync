import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  estimateLoad
} from '../controllers/taskController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = (supabase) => {
  const r = express.Router();
  r.post('/', verifyToken, createTask(supabase));
  r.get('/', verifyToken, getTasks(supabase));
  r.get('/:task_id', verifyToken, getTaskById(supabase));
  r.patch('/:task_id', verifyToken, updateTask(supabase));
  r.delete('/:task_id', verifyToken, deleteTask(supabase));
  r.post('/:task_id/estimate_load', verifyToken, estimateLoad(supabase));
  return r;
};

export default router;