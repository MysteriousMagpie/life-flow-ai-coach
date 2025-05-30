
import { GPTAction } from '../gptParser';

export class ActionParser {
  parseFunctionCalls(functionCalls: any[]): GPTAction[] {
    if (!Array.isArray(functionCalls)) return [];

    return functionCalls.map(call => {
      const { name, arguments: args } = call;
      
      console.log('[PARSING FUNCTION CALL]', { name, args });
      
      // Map function calls to actions
      switch (name) {
        case 'createMeal':
          return { 
            type: 'create', 
            module: 'meals', 
            data: args, 
            functionName: name 
          };
        case 'scheduleWorkout':
          return { 
            type: 'create', 
            module: 'workouts', 
            data: args, 
            functionName: name 
          };
        case 'addTask':
          return { 
            type: 'create', 
            module: 'tasks', 
            data: args, 
            functionName: name 
          };
        case 'addReminder':
          return { 
            type: 'create', 
            module: 'reminders', 
            data: args, 
            functionName: name 
          };
        case 'createTimeBlock':
          return { 
            type: 'create', 
            module: 'time_blocks', 
            data: args, 
            functionName: name 
          };

        // Enhanced meal planning
        case 'create_comprehensive_meal_plan':
          return { 
            type: 'create', 
            module: 'meals', 
            data: { ...args, isComprehensive: true }, 
            functionName: name 
          };
        
        // Enhanced workout planning
        case 'create_fitness_program':
          return { 
            type: 'create', 
            module: 'workouts', 
            data: { ...args, isProgram: true }, 
            functionName: name 
          };
        
        // Smart scheduling
        case 'create_smart_schedule':
          return { 
            type: 'create', 
            module: 'time_blocks', 
            data: { ...args, isSmart: true }, 
            functionName: name 
          };
        
        // Reschedule handling
        case 'reschedule_event':
          return { 
            type: 'update', 
            module: 'time_blocks', 
            id: args.event_id,
            data: { 
              new_time: args.new_time, 
              reason: args.reason 
            }, 
            functionName: name 
          };
        
        // Weekly planning
        case 'generate_weekly_plan':
          return { 
            type: 'create', 
            module: 'analysis', 
            data: { ...args, planType: 'weekly' }, 
            functionName: name 
          };
        
        // Meals module
        case 'create_meal':
          return { 
            type: 'create', 
            module: 'meals', 
            data: args, 
            functionName: name 
          };
        case 'create_meal_plan':
          return { 
            type: 'create', 
            module: 'meals', 
            data: { ...args, isPlan: true }, 
            functionName: name 
          };
        case 'list_meals':
          return { 
            type: 'list', 
            module: 'meals', 
            data: args, 
            functionName: name 
          };

        // Tasks module
        case 'create_task':
          return { 
            type: 'create', 
            module: 'tasks', 
            data: args, 
            functionName: name 
          };
        case 'list_tasks':
          return { 
            type: 'list', 
            module: 'tasks', 
            data: args, 
            functionName: name 
          };
        case 'complete_task':
          return { 
            type: 'complete', 
            module: 'tasks', 
            id: args.id, 
            functionName: name 
          };
        case 'update_task_priority':
          return { 
            type: 'update', 
            module: 'tasks', 
            id: args.id, 
            data: { priority: args.priority }, 
            functionName: name 
          };

        // Workouts module
        case 'create_workout':
          return { 
            type: 'create', 
            module: 'workouts', 
            data: args, 
            functionName: name 
          };
        case 'create_workout_plan':
          return { 
            type: 'create', 
            module: 'workouts', 
            data: { ...args, isPlan: true }, 
            functionName: name 
          };
        case 'complete_workout':
          return { 
            type: 'complete', 
            module: 'workouts', 
            id: args.id, 
            functionName: name 
          };

        // Reminders module
        case 'create_reminder':
          return { 
            type: 'create', 
            module: 'reminders', 
            data: args, 
            functionName: name 
          };
        case 'list_reminders':
          return { 
            type: 'list', 
            module: 'reminders', 
            data: args, 
            functionName: name 
          };

        // Time blocks module
        case 'create_time_block':
          return { 
            type: 'create', 
            module: 'time_blocks', 
            data: args, 
            functionName: name 
          };
        case 'optimize_schedule':
          return { 
            type: 'optimize', 
            module: 'time_blocks', 
            data: args, 
            functionName: name 
          };

        // Analysis functions
        case 'analyze_progress':
          return { 
            type: 'analyze', 
            module: 'analysis', 
            data: args, 
            functionName: name 
          };
        case 'generate_suggestions':
          return { 
            type: 'suggest', 
            module: 'analysis', 
            data: args, 
            functionName: name 
          };

        default:
          console.warn(`Unknown function call: ${name}`);
          return { 
            type: 'create', 
            module: 'tasks', 
            data: {}, 
            functionName: name 
          };
      }
    });
  }
}

export const actionParser = new ActionParser();
