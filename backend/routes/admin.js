import express from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Create + assign task
router.post("/tasks", authMiddleware, requireRole("admin"), async (req, res) => {
  const { title, description, userIds } = req.body;

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert([{ title, description, created_by: req.user.userId }])
    .select()
    .single();

  if (taskError) return res.status(400).json({ error: taskError.message });

  const assignments = userIds.map(uid => ({ task_id: task.id, user_id: uid }));
  const { error: assignError } = await supabase
    .from("task_assignments")
    .insert(assignments);

  if (assignError) return res.status(400).json({ error: assignError.message });

  res.json({ task });
});

// View all tasks
router.get("/tasks", authMiddleware, requireRole("admin"), async (req, res) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, task_assignments(user_id)");

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
