
import { GPTAction } from '../gptParser';
import { useTasks } from '@/hooks/useTasks';
import { ActionResult } from './MealExecutor';

export class TaskExecutor {
  private tasksHook: ReturnType<typeof useTasks>;

  constructor(tasksHook: ReturnType<typeof useTasks>) {
    this.tasksHook = tasksHook;
  }

  async executeAction(action: GPTAction, dataWithUserId: any): Promise<ActionResult> {
    switch (action.functionName) {
      case 'create_task':
        this.tasksHook.createTask(dataWithUserId);
        return {
          success: true,
          message: `Created task: ${dataWithUserId.title}`,
          data: dataWithUserId,
          functionName: action.functionName
        };
      case 'list_tasks':
        return {
          success: true,
          message: 'Retrieved task list',
          data: { filter: dataWithUserId },
          functionName: action.functionName
        };
      case 'complete_task':
        if (action.id) {
          this.tasksHook.completeTask(action.id);
          return {
            success: true,
            message: 'Task marked as complete',
            functionName: action.functionName
          };
        }
        throw new Error('No task ID provided for completion');
      case 'update_task_priority':
        if (action.id && dataWithUserId.priority) {
          this.tasksHook.updateTask({ id: action.id, updates: {} });
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
              this.tasksHook.deleteTask(action.id);
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
}
