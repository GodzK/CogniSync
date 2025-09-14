import { supabase } from '../utils/supabaseClient.js';

export const createFeedback = async (req, res) => {
  const user_id = req.user_id;
  const feedbackData = { user_id, ...req.body };
  const { data, error } = await supabase.from('feedback_logs').insert(feedbackData).select().single();
  if(error) return res.status(400).json({ error: error.message });
  res.json({ feedback_log: data });
};

export const getFeedback = async (req, res) => {
  const { user_id, date_range } = req.query;
  let query = supabase.from('feedback_logs').select('*');
  if(user_id) query = query.eq('user_id', user_id);
  const { data, error } = await query;
  if(error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const getFeedbackById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('feedback_logs').select('*').eq('id', id).single();
  if(error) return res.status(400).json({ error: error.message });
  res.json({ feedback_log: data });
};
