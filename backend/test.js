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

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY); // Use service_role key
const JWT_SECRET = process.env.JWT_SECRET;

// ---------------- Middleware ----------------
const auth = (roles = []) => {
  return async (req, res, next) => {
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
  
  // Validate inputs
  if (!username || !password || !["user", "manager"].includes(role)) {
    return res.status(400).json({ error: "Invalid data: username, password, and role (user or manager) are required" });
  }

  // Validate username format (alphanumeric, dots, underscores, 3-30 characters)
  const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ error: "Invalid username format. Use 3-30 alphanumeric characters, dots, or underscores." });
  }

  // Check existing user
  const { data: existing } = await supabase.from("users").select("*").eq("username", username).single();
  if (existing) return res.status(400).json({ error: "User exists" });

  const hashed = await bcrypt.hash(password, 10);
  const avatar = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 99)}.jpg`;

  // Create user in Supabase auth with a routable domain
  const email = `${username}@mydomain.com`; // Changed from @example.com
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (authError) {
    return res.status(500).json({ error: `Auth error: ${authError.message}` });
  }

  // Insert into public.users with auth UID
  const { error } = await supabase.from("users").insert([
    { id: authUser.user.id, username, password: hashed, role, avatar }
  ]);
  if (error) {
    return res.status(500).json({ error: `Database error: ${error.message}` });
  }

  res.json({ message: "Registered successfully" });
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single();

  if (error || !user) return res.status(400).json({ error: "No user found" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET); // Add username to token
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, avatar: user.avatar } });
});

// Get all users (manager only)  , auth(["manager"])
app.get("/api/users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("id, username, avatar, role");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get tasks
app.get("/api/tasks", auth(), async (req, res) => {
  let query = supabase.from("tasks").select("*");
  if (req.user.role === "user") {
    query = query.eq("assignedto", req.user.id);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create task (manager only)
app.post("/api/tasks", auth(["manager"]), async (req, res) => {
  const { name, status, assignedTo, isUpcoming, dueDate } = req.body;
  if (!name || !status || !assignedTo) return res.status(400).json({ error: "Invalid data" });
  const allowedStatuses = ['approved', 'progress', 'review', 'waiting'];
  if (!allowedStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

  // Validate assignedTo is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(assignedTo)) return res.status(400).json({ error: "Invalid assignedTo format (must be UUID)" });

  // Verify assignedTo exists
  const { data: user } = await supabase.from("users").select("id").eq("id", assignedTo).single();
  if (!user) return res.status(400).json({ error: "Assigned user does not exist" });

  const { error } = await supabase.from("tasks").insert([
    {
      name,
      status,
      checked: false,
      assignedto: assignedTo,
      assignedby: req.user.id,
      isupcoming: !!isUpcoming,
      duedate: dueDate
    },
  ]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Task created" });
});

// Update task
app.put("/api/tasks/:id", auth(), async (req, res) => {
  const taskId = req.params.id;

  // Check permission
  const { data: task } = await supabase.from("tasks").select("*").eq("id", taskId).single();
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (req.user.role === "user" && task.assignedto !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });

  const updates = {};
  for (let [key, value] of Object.entries(req.body)) {
    updates[key.toLowerCase()] = value;
  }

  const { error } = await supabase.from("tasks").update(updates).eq("id", taskId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Task updated" });
});

// Get schedules
app.get("/api/schedules", auth(), async (req, res) => {
  let query = supabase.from("schedules").select("*");
  if (req.user.role === "user") {
    query = query.contains("members", [req.user.id]);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create schedule (manager only)
app.post("/api/schedules", auth(["manager"]), async (req, res) => {
  const { time, name, members, color } = req.body;
  if (!time || !name || !members || !color) return res.status(400).json({ error: "Invalid data" });

  // Verify all members exist
  const { data: users } = await supabase.from("users").select("id").in("id", members);
  if (users.length !== members.length) return res.status(400).json({ error: "Invalid members" });

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