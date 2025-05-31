
export const gptFunctions = [
  {
    name: 'addMeal',
    description: 'Add a meal to the meal planner',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the meal' },
        meal_type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
        planned_date: { type: 'string', format: 'date', description: 'Date for the meal (YYYY-MM-DD)' },
        calories: { type: 'number', description: 'Estimated calories' },
        ingredients: { type: 'array', items: { type: 'string' }, description: 'List of ingredients' },
        instructions: { type: 'string', description: 'Cooking instructions' }
      },
      required: ['name', 'meal_type', 'planned_date']
    }
  },
  {
    name: 'planDailyMeals',
    description: 'Plan meals for a specific day and schedule them in time blocks',
    parameters: {
      type: 'object',
      properties: {
        target_date: { type: 'string', format: 'date', description: 'Target date for meal planning (YYYY-MM-DD)' },
        meals: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Meal name' },
              type: { type: 'string', enum: ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'] },
              calories: { type: 'number', description: 'Estimated calories' },
              ingredients: { type: 'array', items: { type: 'string' } },
              instructions: { type: 'string', description: 'Preparation instructions' }
            },
            required: ['name']
          }
        }
      },
      required: ['meals']
    }
  },
  {
    name: 'addTask',
    description: 'Add a task to the task manager',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        due_date: { type: 'string', format: 'date-time', description: 'Due date (ISO string)' },
        is_completed: { type: 'boolean', default: false }
      },
      required: ['title']
    }
  },
  {
    name: 'addWorkout',
    description: 'Add a workout to the workout planner',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Workout name' },
        shceduled_date: { type: 'string', format: 'date', description: 'Scheduled date (YYYY-MM-DD)' },
        duration: { type: 'number', description: 'Duration in minutes' },
        intensity: { type: 'string', enum: ['low', 'medium', 'high'] },
        is_completed: { type: 'boolean', default: false }
      },
      required: ['name', 'shceduled_date']
    }
  },
  {
    name: 'addReminder',
    description: 'Add a reminder',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Reminder title' },
        due_date: { type: 'string', format: 'date-time', description: 'Due date (ISO string)' },
        is_completed: { type: 'boolean', default: false }
      },
      required: ['title', 'due_date']
    }
  },
  {
    name: 'addTimeBlock',
    description: 'Add a time block to the schedule',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Time block title' },
        start_time: { type: 'string', format: 'date-time', description: 'Start time (ISO string)' },
        end_time: { type: 'string', format: 'date-time', description: 'End time (ISO string)' },
        category: { type: 'string', description: 'Category or type of activity' },
        linked_task_id: { type: 'string', description: 'Optional linked task ID' }
      },
      required: ['title', 'start_time', 'end_time']
    }
  }
];

export async function executeFunctionCall(functionName: string, args: any): Promise<any> {
  console.log(`Executing function: ${functionName} with args:`, args);
  
  // Get authenticated user from Supabase
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('User not authenticated');
  }

  const userId = user.id;

  switch (functionName) {
    case 'addMeal':
      return await addMeal({ ...args, user_id: userId });
    case 'addTask':
      return await addTask({ ...args, user_id: userId });
    case 'addWorkout':
      return await addWorkout({ ...args, user_id: userId });
    case 'addReminder':
      return await addReminder({ ...args, user_id: userId });
    case 'addTimeBlock':
      return await addTimeBlock({ ...args, user_id: userId });
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}

async function addMeal(data: any) {
  const { data: result, error } = await supabase
    .from('meals')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return { success: true, meal: result };
}

async function addTask(data: any) {
  const { data: result, error } = await supabase
    .from('tasks')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return { success: true, task: result };
}

async function addWorkout(data: any) {
  const { data: result, error } = await supabase
    .from('workouts')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return { success: true, workout: result };
}

async function addReminder(data: any) {
  const { data: result, error } = await supabase
    .from('reminders')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return { success: true, reminder: result };
}

async function addTimeBlock(data: any) {
  const { data: result, error } = await supabase
    .from('time_blocks')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return { success: true, timeBlock: result };
}

// Import supabase client
import { supabase } from '../integrations/supabase/client';
