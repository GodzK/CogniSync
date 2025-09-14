import { supabase } from '../utils/supabaseClient.js';

export const syncCalendar = async (req, res) => {
  const user_id = req.user_id;
  const { source, events } = req.body;

  const data = events.map(event => ({ user_id, source, ...event }));
  const { error } = await supabase.from('calendar_events').upsert(data);
  if(error) return res.status(400).json({ error: error.message });
  res.json({ synced: true });
};

export const getCalendar = async (req, res) => {
  const { user_id } = req.params;
  const { date_range } = req.query;
  let query = supabase.from('calendar_events').select('*').eq('user_id', user_id);
  const { data, error } = await query;
  if(error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const deleteEvent = async (req, res) => {
  const { event_id } = req.params;
  const { error } = await supabase.from('calendar_events').delete().eq('id', event_id);
  if(error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
};
