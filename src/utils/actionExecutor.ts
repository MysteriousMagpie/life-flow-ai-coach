
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface GPTAction {
  type: 'addMeal' | 'addTask' | 'addWorkout' | 'addReminder' | 'addTimeBlock';
  payload: any;
}

export class ActionExecutor {
  private toast: any;
  private meals: any;
  private tasks: any;
  private workouts: any;
  private reminders: any;
  private timeBlocks: any;

  constructor(hooks: {
    meals: any;
    tasks: any;
    workouts: any;
    reminders: any;
    timeBlocks: any;
  }) {
    this.meals = hooks.meals;
    this.tasks = hooks.tasks;
    this.workouts = hooks.workouts;
    this.reminders = hooks.reminders;
    this.timeBlocks = hooks.timeBlocks;
  }

  async executeActions(actions: GPTAction[], userId: string): Promise<any[]> {
    const results = [];
    
    for (const action of actions) {
      try {
        const result = await this.executeAction(action, userId);
        results.push({ action: action.type, success: true, result });
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
        results.push({ action: action.type, success: false, error: error.message });
      }
    }
    
    return results;
  }

  private async executeAction(action: GPTAction, userId: string): Promise<any> {
    // Add user_id to payload for all actions
    const payloadWithUser = { ...action.payload, user_id: userId };

    switch (action.type) {
      case 'addMeal':
        return this.meals.createMeal(payloadWithUser);
      
      case 'addTask':
        return this.tasks.createTask(payloadWithUser);
      
      case 'addWorkout':
        return this.workouts.createWorkout(payloadWithUser);
      
      case 'addReminder':
        return this.reminders.createReminder(payloadWithUser);
      
      case 'addTimeBlock':
        return this.timeBlocks.createTimeBlock(payloadWithUser);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }
}
