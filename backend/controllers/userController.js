export const getUser = (supabase) => async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase.from('users').select('*').eq('id', user_id).single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user_profile: data });
};

export const updateUser = (supabase) => async (req, res) => {
  const { user_id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase.from('users').update(updates).eq('id', user_id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user_profile: data });
};

export const getAnalytics = (supabase) => async (req, res) => {
  const { user_id } = req.params;
  const { data: feedbacks, error } = await supabase
    .from('feedback_logs')
    .select('*')
    .eq('user_id', user_id);

  if (error) return res.status(400).json({ error: error.message });

  const cognitive_trend = feedbacks.map(f => f.mood_score);
  const sensory_events = feedbacks.map(f => f.sensory_overload_event);

  res.json({ cognitive_trend, sensory_events });
};