import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = (supabase) => async (req, res) => {
  const { email, password, name, role } = req.body;

  // Validate role
  const validRoles = ['employee', 'manager'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert({ email, password_hash, name, role })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const token = jwt.sign({ user_id: data.id }, process.env.JWT_SECRET);
  res.json({ user_id: data.id, token });
};

export const login = (supabase) => async (req, res) => {
  const { email, password } = req.body;
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.status(400).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET);
  res.json({ user_id: user.id, token });
};

export const logout = async (req, res) => {
  res.json({ success: true });
};

export const getMe = (supabase) => async (req, res) => {
  const user_id = req.user_id;
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ user });
};