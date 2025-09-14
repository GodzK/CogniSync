export const createTask = (supabase) => async (req, res) => {
  const user_id = req.user_id;
  const taskData = { user_id, ...req.body };
  const { data, error } = await supabase.from('tasks').insert(taskData).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ task: data });
};

export const getTasks = (supabase) => async (req, res) => {
  const { user_id, status, date_range } = req.query;

  let query = supabase.from('tasks').select('*');
  if (user_id) query = query.eq('user_id', user_id);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const getTaskById = (supabase) => async (req, res) => {
  const { task_id } = req.params;
  const { data, error } = await supabase.from('tasks').select('*').eq('id', task_id).single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ task: data });
};

export const updateTask = (supabase) => async (req, res) => {
  const { task_id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', task_id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ task: data });
};

export const deleteTask = (supabase) => async (req, res) => {
  const { task_id } = req.params;
  const { error } = await supabase.from('tasks').delete().eq('id', task_id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
};

export const estimateLoad = (supabase) => async (req, res) => {
  const { task_id } = req.params;
  const cognitive_load_estimate = Math.floor(Math.random() * 10) + 1;
  await supabase.from('tasks').update({ cognitive_load_estimate }).eq('id', task_id);
  res.json({ cognitive_load_estimate });
};