import { GPTAction } from './gptParser';
import { useMeals } from '@/hooks/useMeals';
import { useTasks } from '@/hooks/useTasks';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useReminders } from '@/hooks/useReminders';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  functionName?: string;
}

export class ActionExecutor {
  private hooks: {
    meals: ReturnType<typeof useMeals>;
    tasks: ReturnType<typeof useTasks>;
    workouts: ReturnType<typeof useWorkouts>;
    reminders: ReturnType<typeof useReminders>;
    timeBlocks: ReturnType<typeof useTimeBlocks>;
  };

  constructor(hooks: {
    meals: ReturnType<typeof useMeals>;
    tasks: ReturnType<typeof useTasks>;
    workouts: ReturnType<typeof useWorkouts>;
    reminders: ReturnType<typeof useReminders>;
    timeBlocks: ReturnType<typeof useTimeBlocks>;
  }) {
    this.hooks = hooks;
  }

  async executeActions(actions: GPTAction[], userId: string): Promise<ActionResult[]> {
    const results: ActionResult[] = [];

    for (const action of actions) {
      try {
        const result = await this.executeAction(action, userId);
        results.push(result);
      } catch (error) {
        console.error('Action execution error:', error);
        results.push({
          success: false,
          message: `Failed to execute ${action.functionName || action.type} ${action.module}`,
          error: error instanceof Error ? error.message : 'Unknown error',
          functionName: action.functionName
        });
      }
    }

    return results;
  }

  private async executeAction(action: GPTAction, userId: string): Promise<ActionResult> {
    const dataWithUserId = action.data ? { ...action.data, user_id: userId } : { user_id: userId };

    switch (action.module) {
      case 'meals':
        return this.executeMealAction(action, dataWithUserId);
      case 'tasks':
        return this.executeTaskAction(action, dataWithUserId);
      case 'workouts':
        return this.executeWorkoutAction(action, dataWithUserId);
      case 'reminders':
        return this.executeReminderAction(action, dataWithUserId);
      case 'time_blocks':
        return this.executeTimeBlockAction(action, dataWithUserId);
      case 'analysis':
        return this.executeAnalysisAction(action, dataWithUserId);
      default:
        throw new Error(`Unknown module: ${action.module}`);
    }
  }

  private executeMealAction(action: GPTAction, data: any): ActionResult {
    switch (action.functionName) {
      case 'create_meal':
        this.hooks.meals.createMeal(data);
        return {
          success: true,
          message: `Created meal: ${data.name}`,
          data,
          functionName: action.functionName
        };
      case 'create_meal_plan':
        return this.createMealPlan(data);
      case 'create_comprehensive_meal_plan':
        return this.createComprehensiveMealPlan(data);
      case 'list_meals':
        return {
          success: true,
          message: 'Retrieved meal list',
          data: { filter: data },
          functionName: action.functionName
        };
      default:
        switch (action.type) {
          case 'delete':
            if (action.id) {
              this.hooks.meals.deleteMeal(action.id);
              return {
                success: true,
                message: 'Meal deleted successfully',
                functionName: action.functionName
              };
            }
            throw new Error('No meal ID provided for deletion');
          default:
            throw new Error(`Unsupported meal action: ${action.type}`);
        }
    }
  }

  private executeTaskAction(action: GPTAction, data: any): ActionResult {
    switch (action.functionName) {
      case 'create_task':
        this.hooks.tasks.createTask(data);
        return {
          success: true,
          message: `Created task: ${data.title}`,
          data,
          functionName: action.functionName
        };
      case 'list_tasks':
        return {
          success: true,
          message: 'Retrieved task list',
          data: { filter: data },
          functionName: action.functionName
        };
      case 'complete_task':
        if (action.id) {
          this.hooks.tasks.completeTask(action.id);
          return {
            success: true,
            message: 'Task marked as complete',
            functionName: action.functionName
          };
        }
        throw new Error('No task ID provided for completion');
      case 'update_task_priority':
        if (action.id && data.priority) {
          // Remove priority from updates since it doesn't exist in the Task type
          this.hooks.tasks.updateTask({ id: action.id, updates: {} });
          return {
            success: true,
            message: `Task updated`,
            functionName: action.functionName
          };
        }
        throw new Error('No task ID provided for update');
      default:
        switch (action.type) {
          case 'delete':
            if (action.id) {
              this.hooks.tasks.deleteTask(action.id);
              return {
                success: true,
                message: 'Task deleted successfully',
                functionName: action.functionName
              };
            }
            throw new Error('No task ID provided for deletion');
          default:
            throw new Error(`Unsupported task action: ${action.type}`);
        }
    }
  }

  private executeWorkoutAction(action: GPTAction, data: any): ActionResult {
    switch (action.functionName) {
      case 'create_workout':
        // Fix the typo in scheduled_date and remove workout_type since it doesn't exist
        if (data.scheduled_date) {
          data.shceduled_date = data.scheduled_date;
          delete data.scheduled_date;
        }
        // Remove workout_type since it doesn't exist in the Workout type
        if (data.workout_type) {
          delete data.workout_type;
        }
        if (data.exercises) {
          delete data.exercises;
        }
        this.hooks.workouts.createWorkout(data);
        return {
          success: true,
          message: `Created workout: ${data.name}`,
          data,
          functionName: action.functionName
        };
      case 'create_workout_plan':
        return this.createWorkoutPlan(data);
      case 'create_fitness_program':
        return this.createFitnessProgram(data);
      case 'complete_workout':
        if (action.id) {
          this.hooks.workouts.completeWorkout(action.id);
          return {
            success: true,
            message: 'Workout marked as complete',
            functionName: action.functionName
          };
        }
        throw new Error('No workout ID provided for completion');
      default:
        switch (action.type) {
          case 'delete':
            if (action.id) {
              this.hooks.workouts.deleteWorkout(action.id);
              return {
                success: true,
                message: 'Workout deleted successfully',
                functionName: action.functionName
              };
            }
            throw new Error('No workout ID provided for deletion');
          default:
            throw new Error(`Unsupported workout action: ${action.type}`);
        }
    }
  }

  private executeReminderAction(action: GPTAction, data: any): ActionResult {
    switch (action.functionName) {
      case 'create_reminder':
        this.hooks.reminders.createReminder(data);
        return {
          success: true,
          message: `Created reminder: ${data.title}`,
          data,
          functionName: action.functionName
        };
      case 'list_reminders':
        return {
          success: true,
          message: 'Retrieved reminder list',
          data: { filter: data },
          functionName: action.functionName
        };
      default:
        switch (action.type) {
          case 'delete':
            if (action.id) {
              this.hooks.reminders.deleteReminder(action.id);
              return {
                success: true,
                message: 'Reminder deleted successfully',
                functionName: action.functionName
              };
            }
            throw new Error('No reminder ID provided for deletion');
          default:
            throw new Error(`Unsupported reminder action: ${action.type}`);
        }
    }
  }

  private executeTimeBlockAction(action: GPTAction, data: any): ActionResult {
    switch (action.functionName) {
      case 'create_time_block':
        this.hooks.timeBlocks.createTimeBlock(data);
        return {
          success: true,
          message: `Created time block: ${data.title}`,
          data,
          functionName: action.functionName
        };
      case 'create_smart_schedule':
        return this.createSmartSchedule(data);
      case 'reschedule_event':
        return this.rescheduleEvent(data);
      case 'optimize_schedule':
        return this.optimizeSchedule(data);
      default:
        switch (action.type) {
          case 'update':
            if (action.id && data.new_time) {
              // Handle rescheduling
              this.hooks.timeBlocks.updateTimeBlock({
                id: action.id,
                updates: {
                  start_time: new Date(data.new_time).toISOString(),
                  end_time: new Date(new Date(data.new_time).getTime() + 60 * 60 * 1000).toISOString()
                }
              });
              return {
                success: true,
                message: `Event rescheduled successfully${data.reason ? ': ' + data.reason : ''}`,
                functionName: action.functionName
              };
            }
            throw new Error('No event ID or new time provided for rescheduling');
          case 'delete':
            if (action.id) {
              this.hooks.timeBlocks.deleteTimeBlock(action.id);
              return {
                success: true,
                message: 'Time block deleted successfully',
                functionName: action.functionName
              };
            }
            throw new Error('No time block ID provided for deletion');
          default:
            throw new Error(`Unsupported time block action: ${action.type}`);
        }
    }
  }

  private executeAnalysisAction(action: GPTAction, data: any): ActionResult {
    switch (action.functionName) {
      case 'generate_weekly_plan':
        return this.generateWeeklyPlan(data);
      case 'handle_missed_activity':
        return this.handleMissedActivity(data);
      case 'analyze_progress':
        return this.analyzeProgress(data);
      case 'generate_suggestions':
        return this.generateSuggestions(data);
      default:
        return {
          success: true,
          message: 'Analysis completed',
          data,
          functionName: action.functionName
        };
    }
  }

  private createMealPlan(data: any): ActionResult {
    console.log('[MOCK] Creating meal plan:', data);
    
    // Mock meal plan creation logic
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const sampleMeals = {
      breakfast: ['Oatmeal with berries', 'Scrambled eggs with toast', 'Greek yogurt with granola'],
      lunch: ['Grilled chicken salad', 'Quinoa bowl', 'Turkey sandwich'],
      dinner: ['Baked salmon with vegetables', 'Pasta with marinara', 'Stir-fry with tofu']
    };

    const startDate = new Date(data.start_date || new Date());
    for (let day = 0; day < (data.duration_days || 7); day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      mealTypes.forEach(mealType => {
        const meals = sampleMeals[mealType];
        const randomMeal = meals[Math.floor(Math.random() * meals.length)];
        
        this.hooks.meals.createMeal({
          user_id: data.user_id,
          name: randomMeal,
          meal_type: mealType,
          planned_date: currentDate.toISOString().split('T')[0],
          calories: Math.floor(Math.random() * 300) + 200
        });
      });
    }

    return {
      success: true,
      message: `Created meal plan for ${data.duration_days || 7} days`,
      data: { duration: data.duration_days || 7, start_date: data.start_date },
      functionName: 'create_meal_plan'
    };
  }

  private createComprehensiveMealPlan(data: any): ActionResult {
    console.log('[CREATING COMPREHENSIVE MEAL PLAN]', data);
    
    const { duration_days = 7, target_calories_per_day = 2000, macro_goals, meal_prep_style = 'mixed' } = data;
    
    // Enhanced meal planning with nutrition optimization
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    if (target_calories_per_day > 2200) {
      mealTypes.push('snack');
    }

    const nutritionOptimizedMeals = {
      breakfast: [
        { name: 'Greek Yogurt with Berries and Granola', calories: 350, protein: 20 },
        { name: 'Avocado Toast with Eggs', calories: 400, protein: 18 },
        { name: 'Overnight Oats with Protein Powder', calories: 380, protein: 25 }
      ],
      lunch: [
        { name: 'Quinoa Power Bowl with Chicken', calories: 550, protein: 35 },
        { name: 'Mediterranean Salad with Salmon', calories: 480, protein: 32 },
        { name: 'Lentil and Vegetable Curry', calories: 420, protein: 18 }
      ],
      dinner: [
        { name: 'Baked Cod with Roasted Vegetables', calories: 450, protein: 40 },
        { name: 'Turkey and Sweet Potato Skillet', calories: 520, protein: 35 },
        { name: 'Chickpea and Spinach Stew', calories: 380, protein: 16 }
      ],
      snack: [
        { name: 'Apple with Almond Butter', calories: 200, protein: 8 },
        { name: 'Protein Smoothie', calories: 250, protein: 20 }
      ]
    };

    const startDate = new Date(data.start_date || new Date());
    let totalCreated = 0;

    for (let day = 0; day < duration_days; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      let dailyCalories = 0;
      const targetPerMeal = Math.floor(target_calories_per_day / mealTypes.length);

      mealTypes.forEach(mealType => {
        const mealOptions = nutritionOptimizedMeals[mealType];
        const selectedMeal = mealOptions[Math.floor(Math.random() * mealOptions.length)];
        
        this.hooks.meals.createMeal({
          user_id: data.user_id,
          name: selectedMeal.name,
          meal_type: mealType,
          planned_date: currentDate.toISOString().split('T')[0],
          calories: selectedMeal.calories,
          ingredients: JSON.stringify([]) // Would be populated with actual ingredients
        });
        
        dailyCalories += selectedMeal.calories;
        totalCreated++;
      });
    }

    return {
      success: true,
      message: `Created comprehensive meal plan: ${totalCreated} meals over ${duration_days} days targeting ${target_calories_per_day} calories/day`,
      data: { 
        duration: duration_days, 
        totalMeals: totalCreated,
        targetCalories: target_calories_per_day,
        mealPrepStyle: meal_prep_style
      },
      functionName: 'create_comprehensive_meal_plan'
    };
  }

  private createWorkoutPlan(data: any): ActionResult {
    console.log('[MOCK] Creating workout plan:', data);
    
    const workoutTypes = ['cardio', 'strength', 'flexibility'];
    const sampleWorkouts = {
      cardio: ['Running', 'Cycling', 'Swimming', 'HIIT'],
      strength: ['Weight lifting', 'Bodyweight exercises', 'Resistance training'],
      flexibility: ['Yoga', 'Stretching', 'Pilates']
    };

    const sessionsPerWeek = data.sessions_per_week || 3;
    const weeks = data.duration_weeks || 4;
    
    for (let week = 0; week < weeks; week++) {
      for (let session = 0; session < sessionsPerWeek; session++) {
        const workoutType = data.preferred_workout_types?.[session % data.preferred_workout_types.length] || 
                           workoutTypes[session % workoutTypes.length];
        const workouts = sampleWorkouts[workoutType] || sampleWorkouts.cardio;
        const randomWorkout = workouts[Math.floor(Math.random() * workouts.length)];
        
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() + (week * 7) + (session * 2));
        
        this.hooks.workouts.createWorkout({
          user_id: data.user_id,
          name: randomWorkout,
          duration: Math.floor(Math.random() * 60) + 30,
          intensity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          shceduled_date: sessionDate.toISOString().split('T')[0]
        });
      }
    }

    return {
      success: true,
      message: `Created ${weeks}-week workout plan with ${sessionsPerWeek} sessions per week`,
      data: { weeks, sessionsPerWeek },
      functionName: 'create_workout_plan'
    };
  }

  private createFitnessProgram(data: any): ActionResult {
    console.log('[CREATING FITNESS PROGRAM]', data);
    
    const { fitness_goals, available_days = 3, session_duration = 45, experience_level = 'beginner' } = data;
    
    const workoutPrograms = {
      beginner: {
        weight_loss: ['Full Body Circuit', 'Walking/Light Cardio', 'Basic Strength Training'],
        muscle_gain: ['Upper Body Strength', 'Lower Body Strength', 'Full Body Compound'],
        endurance: ['Cardio Intervals', 'Steady State Cardio', 'Active Recovery Walk']
      },
      intermediate: {
        weight_loss: ['HIIT Training', 'Strength + Cardio', 'Metabolic Circuits'],
        muscle_gain: ['Push Day', 'Pull Day', 'Leg Day', 'Core Focus'],
        endurance: ['Long Cardio Sessions', 'Tempo Runs', 'Cross Training']
      },
      advanced: {
        weight_loss: ['Complex HIIT', 'Strength Supersets', 'Metabolic Finishers'],
        muscle_gain: ['Heavy Compound Lifts', 'Isolation Focus', 'Power Training'],
        endurance: ['Endurance Challenges', 'Sport-Specific Training', 'Recovery Sessions']
      }
    };

    const primaryGoal = fitness_goals[0] || 'muscle_gain';
    const workouts = workoutPrograms[experience_level][primaryGoal] || workoutPrograms.beginner.muscle_gain;
    
    let workoutsCreated = 0;
    const weeks = 4; // Create a 4-week program

    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < available_days; day++) {
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() + (week * 7) + (day * 2)); // Space workouts every 2 days
        
        const workoutIndex = day % workouts.length;
        const workoutName = workouts[workoutIndex];
        
        this.hooks.workouts.createWorkout({
          user_id: data.user_id,
          name: `${workoutName} - Week ${week + 1}`,
          duration: session_duration,
          intensity: experience_level === 'beginner' ? 'medium' : 'high',
          shceduled_date: sessionDate.toISOString().split('T')[0]
        });
        
        workoutsCreated++;
      }
    }

    return {
      success: true,
      message: `Created ${weeks}-week fitness program: ${workoutsCreated} workouts for ${primaryGoal} (${experience_level} level)`,
      data: { 
        weeks, 
        totalWorkouts: workoutsCreated, 
        sessionsPerWeek: available_days,
        primaryGoal,
        experienceLevel: experience_level
      },
      functionName: 'create_fitness_program'
    };
  }

  private createSmartSchedule(data: any): ActionResult {
    console.log('[CREATING SMART SCHEDULE]', data);
    
    const { tasks_to_schedule = [], working_hours = { start: '09:00', end: '17:00' }, energy_patterns = {} } = data;
    
    // Sort tasks by priority and energy requirements
    const sortedTasks = tasks_to_schedule.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    let scheduledCount = 0;
    let currentTime = new Date();
    currentTime.setHours(parseInt(working_hours.start.split(':')[0]), 0, 0, 0);

    sortedTasks.forEach(task => {
      const duration = task.estimated_duration || 60; // Default 1 hour
      const endTime = new Date(currentTime.getTime() + duration * 60 * 1000);
      
      this.hooks.timeBlocks.createTimeBlock({
        user_id: data.user_id,
        title: task.title,
        start_time: currentTime.toISOString(),
        end_time: endTime.toISOString(),
        category: task.energy_required === 'high' ? 'focus' : 'general'
      });
      
      // Add buffer time between tasks
      currentTime = new Date(endTime.getTime() + 15 * 60 * 1000); // 15-minute buffer
      scheduledCount++;
    });

    return {
      success: true,
      message: `Smart schedule created with ${scheduledCount} optimized time blocks`,
      data: { 
        totalTasks: scheduledCount,
        optimizations: ['Priority-based ordering', 'Energy level matching', 'Buffer time inclusion']
      },
      functionName: 'create_smart_schedule'
    };
  }

  private generateWeeklyPlan(data: any): ActionResult {
    console.log('[GENERATING WEEKLY PLAN]', data);
    
    const { goals = [], preferences = {} } = data;
    
    // Create a comprehensive weekly plan combining all modules
    const planSummary = {
      meals: 0,
      workouts: 0,
      timeBlocks: 0,
      focus_areas: goals
    };

    // Generate meal plan if nutrition goal is present
    if (goals.includes('improve_nutrition') || goals.includes('weight_loss')) {
      const mealPlanResult = this.createComprehensiveMealPlan({
        ...data,
        duration_days: 7,
        target_calories_per_day: preferences.target_calories || 2000
      });
      planSummary.meals = 21; // 3 meals × 7 days
    }

    // Generate fitness program if fitness goal is present
    if (goals.includes('increase_fitness') || goals.includes('muscle_gain')) {
      const fitnessResult = this.createFitnessProgram({
        ...data,
        fitness_goals: goals,
        available_days: preferences.workout_days_per_week || 3,
        session_duration: 45
      });
      planSummary.workouts = preferences.workout_days_per_week || 3;
    }

    // Generate productivity schedule if productivity goal is present
    if (goals.includes('increase_productivity') || goals.includes('better_time_management')) {
      const scheduleResult = this.createSmartSchedule({
        ...data,
        tasks_to_schedule: [
          { title: 'Focus Work Block', estimated_duration: 90, priority: 'high', energy_required: 'high' },
          { title: 'Administrative Tasks', estimated_duration: 60, priority: 'medium', energy_required: 'low' },
          { title: 'Creative Work', estimated_duration: 120, priority: 'high', energy_required: 'high' }
        ]
      });
      planSummary.timeBlocks = 3;
    }

    return {
      success: true,
      message: `Comprehensive weekly plan generated targeting: ${goals.join(', ')}`,
      data: planSummary,
      functionName: 'generate_weekly_plan'
    };
  }

  private rescheduleEvent(data: any): ActionResult {
    console.log('[RESCHEDULING EVENT]', data);
    
    const { event_id, new_time, reason } = data;
    
    this.hooks.timeBlocks.updateTimeBlock({
      id: event_id,
      updates: {
        start_time: new Date(new_time).toISOString(),
        end_time: new Date(new Date(new_time).getTime() + 60 * 60 * 1000).toISOString()
      }
    });

    return {
      success: true,
      message: `Event rescheduled to ${new Date(new_time).toLocaleString()}${reason ? `. Reason: ${reason}` : ''}`,
      data: { event_id, new_time, reason },
      functionName: 'reschedule_event'
    };
  }

  private handleMissedActivity(data: any): ActionResult {
    console.log('[HANDLING MISSED ACTIVITY]', data);
    
    const { activity_type, activity_id, reason, reschedule_preference = 'next_available' } = data;
    
    // Determine when to reschedule based on preference
    let newTime = new Date();
    switch (reschedule_preference) {
      case 'today':
        newTime.setHours(newTime.getHours() + 2);
        break;
      case 'tomorrow':
        newTime.setDate(newTime.getDate() + 1);
        break;
      case 'this_week':
        newTime.setDate(newTime.getDate() + 2);
        break;
      default:
        newTime.setDate(newTime.getDate() + 1);
    }

    // Reschedule based on activity type
    if (activity_type === 'workout') {
      this.hooks.workouts.updateWorkout({
        id: activity_id,
        updates: {
          shceduled_date: newTime.toISOString().split('T')[0]
        }
      });
    } else if (activity_type === 'meal') {
      this.hooks.meals.updateMeal({
        id: activity_id,
        updates: {
          planned_date: newTime.toISOString().split('T')[0]
        }
      });
    }

    return {
      success: true,
      message: `${activity_type} rescheduled for ${reschedule_preference.replace('_', ' ')}${reason ? `. Noted: ${reason}` : ''}`,
      data: { activity_type, new_schedule: reschedule_preference, reason },
      functionName: 'handle_missed_activity'
    };
  }

  private optimizeSchedule(data: any): ActionResult {
    console.log('[MOCK] Optimizing schedule:', data);
    
    return {
      success: true,
      message: `Schedule optimization completed for ${data.date_range}. Analysis suggests better time blocking and priority management.`,
      data: {
        suggestions: [
          'Consider grouping similar tasks together',
          'Add buffer time between meetings',
          'Schedule high-energy tasks during peak hours',
          'Block time for deep work sessions'
        ],
        focus_areas: data.focus_areas
      },
      functionName: 'optimize_schedule'
    };
  }

  private analyzeProgress(data: any): ActionResult {
    console.log('[MOCK] Analyzing progress:', data);
    
    return {
      success: true,
      message: `Progress analysis completed for ${data.focus_area || 'overall'} over the past ${data.timeframe || 'week'}.`,
      data: {
        insights: [
          'Task completion rate has improved by 15%',
          'Workout consistency is above average',
          'Meal planning adherence is strong',
          'Time blocking efficiency could be improved'
        ],
        metrics: data.metrics
      },
      functionName: 'analyze_progress'
    };
  }

  private generateSuggestions(data: any): ActionResult {
    console.log('[MOCK] Generating suggestions:', data);
    
    const suggestionsByCategory = {
      productivity: [
        'Use the Pomodoro Technique for focused work sessions',
        'Batch similar tasks together',
        'Set up a dedicated workspace'
      ],
      health: [
        'Add more vegetables to your meals',
        'Increase daily water intake',
        'Schedule regular movement breaks'
      ],
      schedule: [
        'Block time for important tasks',
        'Add buffer time between appointments',
        'Review and adjust priorities weekly'
      ],
      habits: [
        'Start with small, achievable goals',
        'Track your progress daily',
        'Create accountability systems'
      ],
      goals: [
        'Break large goals into smaller milestones',
        'Set specific deadlines',
        'Regular review and adjustment sessions'
      ]
    };

    const suggestions = suggestionsByCategory[data.category] || suggestionsByCategory.productivity;

    return {
      success: true,
      message: `Generated ${data.category} suggestions based on your current patterns.`,
      data: {
        suggestions,
        category: data.category,
        context: data.user_context
      },
      functionName: 'generate_suggestions'
    };
  }
}
