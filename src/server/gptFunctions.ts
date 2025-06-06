
import { supabase } from '../integrations/supabase/client';

export const gptFunctions = [
  {
    name: 'addMeal',
    description: 'Add a meal to the meal planner (requires user to be logged in)',
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
    description: 'Plan meals for a specific day and schedule them in time blocks (requires user to be logged in)',
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
        scheduled_date: { type: 'string', format: 'date', description: 'Scheduled date (YYYY-MM-DD)' },
        duration: { type: 'number', description: 'Duration in minutes' },
        intensity: { type: 'string', enum: ['low', 'medium', 'high'] },
        is_completed: { type: 'boolean', default: false }
      },
      required: ['name', 'scheduled_date']
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
  console.log(`[FUNCTION CALL] Executing function: ${functionName} with args:`, args);
  
  // Get authenticated user from Supabase
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error('[FUNCTION AUTH ERROR] User not authenticated:', error);
    return {
      success: false,
      error: 'User not authenticated',
      message: 'You must be logged in to use this feature. Please log in and try again.',
      requiresAuth: true,
      authErrorCode: 'NOT_AUTHENTICATED'
    };
  }

  console.log(`[FUNCTION CALL] User authenticated: ${user.id}`);
  const userId = user.id;

  try {
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
        console.error(`[FUNCTION CALL ERROR] Unknown function: ${functionName}`);
        return {
          success: false,
          error: 'Unknown function',
          message: `Function ${functionName} is not supported`,
          functionName
        };
    }
  } catch (error) {
    console.error(`[FUNCTION CALL ERROR] Error executing ${functionName}:`, error);
    return {
      success: false,
      error: 'Function execution failed',
      message: 'An error occurred while processing your request. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error',
      functionName
    };
  }
}

async function addMeal(data: any) {
  console.log('[ADD MEAL] Starting with data:', data);
  
  try {
    // Validate required data
    if (!data.user_id) {
      console.error('[ADD MEAL ERROR] No user_id provided');
      return {
        success: false,
        error: 'User authentication required',
        message: 'You must be logged in to add meals to your planner',
        requiresAuth: true,
        authErrorCode: 'MISSING_USER_ID'
      };
    }

    // Use tomorrow's date if no date is provided
    const plannedDate = data.planned_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const mealData = {
      user_id: data.user_id,
      name: data.name,
      meal_type: data.meal_type,
      planned_date: plannedDate,
      calories: data.calories || null,
      ingredients: data.ingredients ? JSON.stringify(data.ingredients) : null,
      instructions: data.instructions || null
    };

    console.log('[ADD MEAL] Inserting meal data:', mealData);

    const { data: result, error } = await supabase
      .from('meals')
      .insert(mealData)
      .select()
      .single();
    
    if (error) {
      console.error('[ADD MEAL ERROR] Database error:', error);
      
      // Handle specific database errors
      if (error.code === '23503') {
        return {
          success: false,
          error: 'User profile not found',
          message: 'Please complete your profile setup before adding meals',
          requiresAuth: true,
          authErrorCode: 'PROFILE_NOT_FOUND'
        };
      }
      
      return {
        success: false,
        error: 'Database error',
        message: 'Failed to save meal to planner. Please try again.',
        details: error.message,
        errorCode: error.code
      };
    }

    console.log('[ADD MEAL] Successfully created meal:', result);

    // Create time block for the meal
    if (data.meal_type && plannedDate) {
      const mealTimes = {
        breakfast: '08:00',
        lunch: '12:30',
        dinner: '18:30',
        snack: '15:00'
      };

      const mealTime = mealTimes[data.meal_type] || '12:00';
      const [hours, minutes] = mealTime.split(':').map(Number);
      
      const startTime = new Date(plannedDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      try {
        const { data: timeBlockResult, error: timeBlockError } = await supabase
          .from('time_blocks')
          .insert({
            user_id: data.user_id,
            title: `${data.meal_type.charAt(0).toUpperCase() + data.meal_type.slice(1)}: ${data.name}`,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            category: 'meal'
          });
          
        if (timeBlockError) {
          console.error('[ADD MEAL ERROR] Time block creation error:', timeBlockError);
          // Don't fail the entire operation if time block creation fails
        } else {
          console.log('[ADD MEAL] Successfully created time block:', timeBlockResult);
        }
      } catch (timeBlockError) {
        console.error('[ADD MEAL ERROR] Failed to create time block for meal:', timeBlockError);
      }
    }
    
    return { 
      success: true, 
      meal: result,
      message: `Successfully added ${data.name} to your meal planner for ${plannedDate}`,
      scheduledFor: plannedDate
    };
  } catch (error) {
    console.error('[ADD MEAL ERROR] Unexpected error:', error);
    return {
      success: false,
      error: 'Unexpected error',
      message: 'An unexpected error occurred while adding the meal. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
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
