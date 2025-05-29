
export interface ParsedResponse {
  message: string;
  actions: GPTAction[];
  activeModule: string | null;
  data: any;
}

export interface GPTAction {
  type: 'create' | 'update' | 'delete' | 'list' | 'complete' | 'incomplete' | 'analyze' | 'optimize' | 'suggest';
  module: 'meals' | 'tasks' | 'workouts' | 'reminders' | 'time_blocks' | 'analysis';
  data?: any;
  id?: string;
  functionName?: string;
}

export class GPTParser {
  async processInput(input: string): Promise<ParsedResponse> {
    try {
      const response = await fetch('http://localhost:5000/api/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      // Parse function calls from GPT response
      const actions = this.parseFunctionCalls(json.function_calls || []);
      
      return {
        message: json.message || "I'm here to help you plan your life better!",
        actions,
        activeModule: this.determineActiveModule(actions),
        data: json.data || {}
      };
    } catch (error) {
      console.error('GPT Parser Error:', error);
      return {
        message: "I'm having trouble connecting to my AI services. Please try again.",
        actions: [],
        activeModule: null,
        data: {}
      };
    }
  }

  private parseFunctionCalls(functionCalls: any[]): GPTAction[] {
    if (!Array.isArray(functionCalls)) return [];

    return functionCalls.map(call => {
      const { name, arguments: args } = call;
      
      console.log('[PARSING FUNCTION CALL]', { name, args });
      
      switch (name) {
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

  private determineActiveModule(actions: GPTAction[]): string | null {
    if (actions.length === 0) return null;
    
    // Find the most relevant module from actions
    const moduleCount = actions.reduce((acc, action) => {
      // Map analysis module to appropriate UI module
      const uiModule = action.module === 'analysis' ? null : action.module;
      if (uiModule) {
        acc[uiModule] = (acc[uiModule] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Special handling for meal plans and workout plans
    const hasMealPlan = actions.some(a => a.functionName === 'create_meal_plan');
    const hasWorkoutPlan = actions.some(a => a.functionName === 'create_workout_plan');
    const hasScheduleOptimization = actions.some(a => a.functionName === 'optimize_schedule');

    if (hasMealPlan) return 'meals';
    if (hasWorkoutPlan) return 'workouts';
    if (hasScheduleOptimization) return 'timeline';

    return Object.entries(moduleCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
  }
}

export const gptParser = new GPTParser();
