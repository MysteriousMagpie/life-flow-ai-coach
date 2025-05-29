
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
          message: `Failed to execute ${action.type} ${action.module}`,
          error: error instanceof Error ? error.message : 'Unknown error'
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
      default:
        throw new Error(`Unknown module: ${action.module}`);
    }
  }

  private executeMealAction(action: GPTAction, data: any): ActionResult {
    switch (action.type) {
      case 'create':
        this.hooks.meals.createMeal(data);
        return {
          success: true,
          message: `Created meal: ${data.name}`,
          data
        };
      case 'delete':
        if (action.id) {
          this.hooks.meals.deleteMeal(action.id);
          return {
            success: true,
            message: 'Meal deleted successfully'
          };
        }
        throw new Error('No meal ID provided for deletion');
      default:
        throw new Error(`Unsupported meal action: ${action.type}`);
    }
  }

  private executeTaskAction(action: GPTAction, data: any): ActionResult {
    switch (action.type) {
      case 'create':
        this.hooks.tasks.createTask(data);
        return {
          success: true,
          message: `Created task: ${data.title}`,
          data
        };
      case 'complete':
        if (action.id) {
          this.hooks.tasks.completeTask(action.id);
          return {
            success: true,
            message: 'Task marked as complete'
          };
        }
        throw new Error('No task ID provided for completion');
      case 'delete':
        if (action.id) {
          this.hooks.tasks.deleteTask(action.id);
          return {
            success: true,
            message: 'Task deleted successfully'
          };
        }
        throw new Error('No task ID provided for deletion');
      default:
        throw new Error(`Unsupported task action: ${action.type}`);
    }
  }

  private executeWorkoutAction(action: GPTAction, data: any): ActionResult {
    switch (action.type) {
      case 'create':
        this.hooks.workouts.createWorkout(data);
        return {
          success: true,
          message: `Created workout: ${data.name}`,
          data
        };
      case 'complete':
        if (action.id) {
          this.hooks.workouts.completeWorkout(action.id);
          return {
            success: true,
            message: 'Workout marked as complete'
          };
        }
        throw new Error('No workout ID provided for completion');
      case 'delete':
        if (action.id) {
          this.hooks.workouts.deleteWorkout(action.id);
          return {
            success: true,
            message: 'Workout deleted successfully'
          };
        }
        throw new Error('No workout ID provided for deletion');
      default:
        throw new Error(`Unsupported workout action: ${action.type}`);
    }
  }

  private executeReminderAction(action: GPTAction, data: any): ActionResult {
    switch (action.type) {
      case 'create':
        this.hooks.reminders.createReminder(data);
        return {
          success: true,
          message: `Created reminder: ${data.title}`,
          data
        };
      case 'delete':
        if (action.id) {
          this.hooks.reminders.deleteReminder(action.id);
          return {
            success: true,
            message: 'Reminder deleted successfully'
          };
        }
        throw new Error('No reminder ID provided for deletion');
      default:
        throw new Error(`Unsupported reminder action: ${action.type}`);
    }
  }

  private executeTimeBlockAction(action: GPTAction, data: any): ActionResult {
    switch (action.type) {
      case 'create':
        this.hooks.timeBlocks.createTimeBlock(data);
        return {
          success: true,
          message: `Created time block: ${data.title}`,
          data
        };
      case 'delete':
        if (action.id) {
          this.hooks.timeBlocks.deleteTimeBlock(action.id);
          return {
            success: true,
            message: 'Time block deleted successfully'
          };
        }
        throw new Error('No time block ID provided for deletion');
      default:
        throw new Error(`Unsupported time block action: ${action.type}`);
    }
  }
}
