export const suggestTaskOrder = async (req, res) => {
  const { tasks, cognitive_loads } = req.body;
  // ตัวอย่างเรียงตาม cognitive_load ต่ำไปสูง
  const ordered_tasks = tasks.map((task, i) => ({ task_id: task, load: cognitive_loads[i] }))
                              .sort((a,b) => a.load - b.load)
                              .map(t => t.task_id);
  res.json({ ordered_tasks });
};

export const sensoryAlert = async (req, res) => {
  const { sensory_sensitivity, environment_data } = req.body;
  // ตัวอย่าง dummy: alert สูงสุด
  const alert_level = Math.max(...Object.values(sensory_sensitivity));
  res.json({ alert_level });
};
