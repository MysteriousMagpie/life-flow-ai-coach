
export { mealsApi } from './meals';
export { tasksApi } from './tasks';
export { workoutsApi } from './workouts';
export { remindersApi } from './reminders';
export { timeBlocksApi } from './timeBlocks';

import { supabase as browserSupabase } from './client';
import { supabase as serverSupabase } from './serverClient';

export const supabase = typeof window === 'undefined' ? serverSupabase : browserSupabase;
