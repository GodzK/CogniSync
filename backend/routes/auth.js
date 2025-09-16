import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { email, password, role } = req.body;

  const hashed = bcrypt.hashSync(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([{ email, password: hashed, role: role || "user" }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "User created", user: data });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) return res.status(401).json({ error: "Invalid credentials" });

  if (!user.password) return res.status(400).json({ error: "User has no password set" });

  const valid = bcrypt.compareSync(password, user.password.trim());
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

export default router;
