import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import feedbackRoutes from './routes/feedback.js';
import calendarRoutes from './routes/calendar.js';
import aiRoutes from './routes/ai.js';

// Load .env and verify
dotenv.config({ path: './.env' });
console.log('SUPABASE_URL in server.js:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY in server.js:', process.env.SUPABASE_KEY);

// Initialize supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined in .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes correctly
app.use('/api/auth', authRoutes(supabase));
app.use('/api/users', userRoutes(supabase));
app.use('/api/tasks', taskRoutes(supabase));
app.use('/api/feedback', feedbackRoutes); // Remove (supabase)
app.use('/api/calendar', calendarRoutes); // Remove (supabase)
app.use('/api/ai', aiRoutes); // Already correct

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));