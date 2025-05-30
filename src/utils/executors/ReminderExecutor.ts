
import { GPTAction } from '../gptParser';
import { useReminders } from '@/hooks/useReminders';
import { ActionResult } from './MealExecutor';

export class ReminderExecutor {
  private remindersHook: ReturnType<typeof useReminders>;

  constructor(remindersHook: ReturnType<typeof useReminders>) {
    this.remindersHook = remindersHook;
  }

  async executeAction(action: GPTAction, dataWithUserId: any): Promise<ActionResult> {
    switch (action.functionName) {
      case 'create_reminder':
        this.remindersHook.createReminder(dataWithUserId);
        return {
          success: true,
          message: `Created reminder: ${dataWithUserId.title}`,
          data: dataWithUserId,
          functionName: action.functionName
        };
      case 'list_reminders':
        return {
          success: true,
          message: 'Retrieved reminder list',
          data: { filter: dataWithUserId },
          functionName: action.functionName
        };
      default:
        switch (action.type) {
          case 'delete':
            if (action.id) {
              this.remindersHook.deleteReminder(action.id);
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
}
