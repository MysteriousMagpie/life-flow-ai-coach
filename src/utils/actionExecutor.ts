
import { GPTAction } from './gptParser';
import { useMeals } from '@/hooks/useMeals';
import { useTasks } from '@/hooks/useTasks';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useReminders } from '@/hooks/useReminders';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';

import { MealExecutor, ActionResult } from './executors/MealExecutor';
import { TaskExecutor } from './executors/TaskExecutor';
import { WorkoutExecutor } from './executors/WorkoutExecutor';
import { ReminderExecutor } from './executors/ReminderExecutor';
import { TimeBlockExecutor } from './executors/TimeBlockExecutor';
import { AnalysisExecutor } from './executors/AnalysisExecutor';

export { ActionResult };

export class ActionExecutor {
  private mealExecutor: MealExecutor;
  private taskExecutor: TaskExecutor;
  private workoutExecutor: WorkoutExecutor;
  private reminderExecutor: ReminderExecutor;
  private timeBlockExecutor: TimeBlockExecutor;
  private analysisExecutor: AnalysisExecutor;

  constructor(hooks: {
    meals: ReturnType<typeof useMeals>;
    tasks: ReturnType<typeof useTasks>;
    workouts: ReturnType<typeof useWorkouts>;
    reminders: ReturnType<typeof useReminders>;
    timeBlocks: ReturnType<typeof useTimeBlocks>;
  }) {
    this.mealExecutor = new MealExecutor(hooks.meals);
    this.taskExecutor = new TaskExecutor(hooks.tasks);
    this.workoutExecutor = new WorkoutExecutor(hooks.workouts);
    this.reminderExecutor = new ReminderExecutor(hooks.reminders);
    this.timeBlockExecutor = new TimeBlockExecutor(hooks.timeBlocks);
    this.analysisExecutor = new AnalysisExecutor(
      this.mealExecutor,
      this.workoutExecutor,
      this.timeBlockExecutor
    );
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
        return this.mealExecutor.executeAction(action, dataWithUserId);
      case 'tasks':
        return this.taskExecutor.executeAction(action, dataWithUserId);
      case 'workouts':
        return this.workoutExecutor.executeAction(action, dataWithUserId);
      case 'reminders':
        return this.reminderExecutor.executeAction(action, dataWithUserId);
      case 'time_blocks':
        return this.timeBlockExecutor.executeAction(action, dataWithUserId);
      case 'analysis':
        return this.analysisExecutor.executeAction(action, dataWithUserId);
      default:
        throw new Error(`Unknown module: ${action.module}`);
    }
  }
}
