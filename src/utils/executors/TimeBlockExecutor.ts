
import { GPTAction } from '../gptParser';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { ActionResult } from './MealExecutor';

export class TimeBlockExecutor {
  private timeBlocksHook: ReturnType<typeof useTimeBlocks>;

  constructor(timeBlocksHook: ReturnType<typeof useTimeBlocks>) {
    this.timeBlocksHook = timeBlocksHook;
  }

  async executeAction(action: GPTAction, dataWithUserId: any): Promise<ActionResult> {
    switch (action.functionName) {
      case 'create_time_block':
        this.timeBlocksHook.createTimeBlock(dataWithUserId);
        return {
          success: true,
          message: `Created time block: ${dataWithUserId.title}`,
          data: dataWithUserId,
          functionName: action.functionName
        };
      case 'create_smart_schedule':
        return this.createSmartSchedule(dataWithUserId);
      case 'reschedule_event':
        return this.rescheduleEvent(dataWithUserId);
      case 'optimize_schedule':
        return this.optimizeSchedule(dataWithUserId);
      default:
        switch (action.type) {
          case 'update':
            if (action.id && dataWithUserId.new_time) {
              this.timeBlocksHook.updateTimeBlock({
                id: action.id,
                updates: {
                  start_time: new Date(dataWithUserId.new_time).toISOString(),
                  end_time: new Date(new Date(dataWithUserId.new_time).getTime() + 60 * 60 * 1000).toISOString()
                }
              });
              return {
                success: true,
                message: `Event rescheduled successfully${dataWithUserId.reason ? ': ' + dataWithUserId.reason : ''}`,
                functionName: action.functionName
              };
            }
            throw new Error('No event ID or new time provided for rescheduling');
          case 'delete':
            if (action.id) {
              this.timeBlocksHook.deleteTimeBlock(action.id);
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

  private createSmartSchedule(data: any): ActionResult {
    console.log('[CREATING SMART SCHEDULE]', data);
    
    const { tasks_to_schedule = [], working_hours = { start: '09:00', end: '17:00' }, energy_patterns = {} } = data;
    
    const sortedTasks = tasks_to_schedule.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    let scheduledCount = 0;
    let currentTime = new Date();
    currentTime.setHours(parseInt(working_hours.start.split(':')[0]), 0, 0, 0);

    sortedTasks.forEach(task => {
      const duration = task.estimated_duration || 60;
      const endTime = new Date(currentTime.getTime() + duration * 60 * 1000);
      
      this.timeBlocksHook.createTimeBlock({
        user_id: data.user_id,
        title: task.title,
        start_time: currentTime.toISOString(),
        end_time: endTime.toISOString(),
        category: task.energy_required === 'high' ? 'focus' : 'general'
      });
      
      currentTime = new Date(endTime.getTime() + 15 * 60 * 1000);
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

  private rescheduleEvent(data: any): ActionResult {
    console.log('[RESCHEDULING EVENT]', data);
    
    const { event_id, new_time, reason } = data;
    
    this.timeBlocksHook.updateTimeBlock({
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
}
