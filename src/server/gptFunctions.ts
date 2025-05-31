
import { supabase } from '../integrations/supabase/client';

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
    case 'planDailyMeals':
      return await planDailyMeals({ ...args, user_id: userId });
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
  console.log('[ADD MEAL] Starting with data:', data);
  
  try {
    // Get authenticated user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[ADD MEAL ERROR] User not authenticated:', authError);
      throw new Error('User not authenticated');
    }

    const mealData = {
      user_id: user.id,
      name: data.name,
      meal_type: data.meal_type,
      planned_date: data.planned_date,
      calories: data.calories || null,
      ingredients: data.ingredients ? JSON.stringify(data.ingredients) : null,
      instructions: data.instructions || null
    };

    const { data: result, error } = await supabase
      .from('meals')
      .insert(mealData)
      .select()
      .single();
    
    if (error) {
      console.error('[ADD MEAL ERROR] Database error:', error);
      throw error;
    }

    console.log('[ADD MEAL] Successfully created meal:', result);

    // Optionally create a time block for the meal
    if (data.meal_type && data.planned_date) {
      const mealTimes = {
        breakfast: '08:00',
        lunch: '12:30',
        dinner: '18:30',
        snack: '15:00'
      };

      const mealTime = mealTimes[data.meal_type] || '12:00';
      const [hours, minutes] = mealTime.split(':').map(Number);
      
      const startTime = new Date(data.planned_date);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30); // 30 minute meal duration

      try {
        const { data: timeBlockResult, error: timeBlockError } = await supabase
          .from('time_blocks')
          .insert({
            user_id: user.id,
            title: `${data.meal_type.charAt(0).toUpperCase() + data.meal_type.slice(1)}: ${data.name}`,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            category: 'meal'
          });
          
        if (timeBlockError) {
          console.error('[ADD MEAL ERROR] Time block creation error:', timeBlockError);
        } else {
          console.log('[ADD MEAL] Successfully created time block:', timeBlockResult);
        }
      } catch (timeBlockError) {
        console.error('[ADD MEAL ERROR] Failed to create time block for meal:', timeBlockError);
        // Don't fail the entire operation if time block creation fails
      }
    }
    
    return { success: true, meal: result };
  } catch (error) {
    console.error('[ADD MEAL ERROR] Error:', error);
    throw error;
  }
}

async function planDailyMeals(data: any) {
  const { meals = [], target_date, user_id } = data;
  const planDate = target_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const results = [];
  const mealTimes = {
    breakfast: '08:00',
    morning_snack: '10:30',
    lunch: '12:30',
    afternoon_snack: '15:00',
    dinner: '18:30',
    evening_snack: '20:30'
  };

  for (const meal of meals) {
    const mealType = meal.type || 'lunch';
    
    // Create meal record
    const mealData = {
      user_id,
      name: meal.name,
      meal_type: mealType,
      planned_date: planDate,
      calories: meal.calories || null,
      ingredients: meal.ingredients ? JSON.stringify(meal.ingredients) : null,
      instructions: meal.instructions || null
    };

    try {
      const { data: result, error } = await supabase
        .from('meals')
        .insert(mealData)
        .select()
        .single();
      
      if (error) throw error;
      results.push(result);

      // Create time block
      const mealTime = mealTimes[mealType] || '12:00';
      const [hours, minutes] = mealTime.split(':').map(Number);
      
      const startTime = new Date(planDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (mealType.includes('snack') ? 15 : 30));

      await supabase
        .from('time_blocks')
        .insert({
          user_id,
          title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1).replace('_', ' ')}: ${meal.name}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          category: 'meal'
        });
    } catch (error) {
      console.error('Error creating meal or time block:', error);
    }
  }
  
  return { success: true, meals: results, planDate };
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
