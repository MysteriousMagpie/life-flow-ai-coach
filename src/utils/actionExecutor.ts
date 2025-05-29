
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
          this.hooks.tasks.updateTask({ id: action.id, updates: { priority: data.priority } });
          return {
            success: true,
            message: `Task priority updated to ${data.priority}`,
            functionName: action.functionName
          };
        }
        throw new Error('No task ID or priority provided for update');
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
        // Fix the typo in scheduled_date
        if (data.scheduled_date) {
          data.shceduled_date = data.scheduled_date;
          delete data.scheduled_date;
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
      case 'optimize_schedule':
        return this.optimizeSchedule(data);
      default:
        switch (action.type) {
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

  // Mock implementations for complex functions
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
          workout_type: workoutType,
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
