import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const JWT_SECRET = process.env.JWT_SECRET;

// ---------------- Middleware ----------------
const auth = (roles = []) => {
  return (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token" });

    try {
      const verified = jwt.verify(token, JWT_SECRET);
      if (roles.length && !roles.includes(verified.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = verified;
      next();
    } catch {
      res.status(400).json({ error: "Invalid token" });
    }
  };
};

// ---------------- Routes ----------------

// Register
app.post("/api/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !["user", "manager"].includes(role)) {
    return res.status(400).json({ error: "Invalid data" });
  }

  // check existing
  const { data: existing } = await supabase.from("users").select("*").eq("username", username).single();
  if (existing) return res.status(400).json({ error: "User exists" });

  const hashed = await bcrypt.hash(password, 10);
  const avatar = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 99)}.jpg`;

  const { error } = await supabase.from("users").insert([{ username, password: hashed, role, avatar }]);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Registered" });
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single();

  if (error || !user) return res.status(400).json({ error: "No user" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, avatar: user.avatar } });
});

// Get all users (manager only)
app.get("/api/users", auth(["manager"]), async (req, res) => {
  const { data, error } = await supabase.from("users").select("id, username, avatar, role");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get tasks
app.get("/api/tasks", auth(), async (req, res) => {
  let query = supabase.from("tasks").select("*");
  if (req.user.role === "user") {
    query = query.eq("assignedTo", req.user.id);
  }
  // Removed eq("assignedBy") for managers to see all tasks
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create task (manager only)
app.post("/api/tasks", auth(["manager"]), async (req, res) => {
  const { name, status, assignedTo, isUpcoming, dueDate } = req.body;
  if (!name || !status || !assignedTo) return res.status(400).json({ error: "Invalid data" });

  const { error } = await supabase.from("tasks").insert([
    { name, status, checked: false, assignedTo, assignedBy: req.user.id, isUpcoming: !!isUpcoming, dueDate },
  ]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Task created" });
});

// Update task
app.put("/api/tasks/:id", auth(), async (req, res) => {
  const taskId = req.params.id;

  // check permission
  const { data: task } = await supabase.from("tasks").select("*").eq("id", taskId).single();
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (req.user.role === "user" && task.assignedTo !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });
  // Removed assignedBy check for managers to update any task

  const { error } = await supabase.from("tasks").update(req.body).eq("id", taskId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Task updated" });
});

// Get schedules
app.get("/api/schedules", auth(), async (req, res) => {
  let query = supabase.from("schedules").select("*");
  if (req.user.role === "user") {
    query = query.contains("members", [req.user.id]); // members = array column
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create schedule (manager only)
app.post("/api/schedules", auth(["manager"]), async (req, res) => {
  const { time, name, members, color } = req.body;
  if (!time || !name || !members || !color) return res.status(400).json({ error: "Invalid data" });

  const { error } = await supabase.from("schedules").insert([
    { time, name, members, color },
  ]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Schedule created" });
});

// ---------------- Start server ----------------
app.listen(process.env.PORT, () => {
  console.log(`✅ Backend running on port ${process.env.PORT}`);
});