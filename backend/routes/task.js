import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Get tasks for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, task_assignments(user_id)")
    .in("id",
      (await supabase.from("task_assignments").select("task_id").eq("user_id", req.user.userId)).data?.map(t => t.task_id) || []
    );

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update task status
router.patch("/:id", authMiddleware, async (req, res) => {
  const { status } = req.body;
  const taskId = req.params.id;

  // check ownership
  const { data: assigned } = await supabase
    .from("task_assignments")
    .select("*")
    .eq("task_id", taskId)
    .eq("user_id", req.user.userId)
    .maybeSingle();

  if (!assigned) return res.status(403).json({ error: "Not your task" });

  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
