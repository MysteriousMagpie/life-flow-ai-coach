export interface ParsedResponse {
  message: string;
  actions: GPTAction[];
  activeModule: string | null;
  data: any;
  functionResults?: any[];
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
        data: json.data || {},
        functionResults: json.function_results || []
      };
    } catch (error) {
      console.error('GPT Parser Error:', error);
      return {
        message: "I'm having trouble connecting to my AI services. Please try again.",
        actions: [],
        activeModule: null,
        data: {},
        functionResults: []
      };
    }
  }

  // Enhanced planning input detection
  detectPlanningIntent(input: string): { 
    isPlanning: boolean; 
    goals: string[]; 
    timeframe: 'day' | 'week' | 'month';
    preferences: any;
  } {
    const planningKeywords = [
      'help me', 'plan', 'schedule', 'organize', 'improve', 'better',
      'weekly plan', 'meal plan', 'workout plan', 'time management'
    ];
    
    const hasKeywords = planningKeywords.some(keyword => 
      input.toLowerCase().includes(keyword)
    );

    if (!hasKeywords) {
      return { isPlanning: false, goals: [], timeframe: 'week', preferences: {} };
    }

    // Extract goals
    const goals = this.extractGoals(input);
    
    // Determine timeframe
    const timeframe = this.extractTimeframe(input);
    
    // Extract preferences
    const preferences = this.extractPreferences(input);

    return {
      isPlanning: true,
      goals,
      timeframe,
      preferences
    };
  }

  private extractGoals(input: string): string[] {
    const goals: string[] = [];
    
    // Health and fitness goals
    if (/eat\s+(better|healthier|clean)/i.test(input)) {
      goals.push('improve_nutrition');
    }
    if (/gym|workout|exercise|fitness/i.test(input)) {
      goals.push('increase_fitness');
    }
    if (/lose\s+weight/i.test(input)) {
      goals.push('weight_loss');
    }
    if (/gain\s+(muscle|weight)/i.test(input)) {
      goals.push('muscle_gain');
    }
    
    // Productivity goals
    if (/productive|focus|organized/i.test(input)) {
      goals.push('increase_productivity');
    }
    if (/time\s+management/i.test(input)) {
      goals.push('better_time_management');
    }
    
    // General wellness
    if (/balance|stress|relax/i.test(input)) {
      goals.push('work_life_balance');
    }
    
    return goals.length > 0 ? goals : ['general_improvement'];
  }

  private extractTimeframe(input: string): 'day' | 'week' | 'month' {
    if (/today|tomorrow/i.test(input)) return 'day';
    if (/month|monthly/i.test(input)) return 'month';
    return 'week'; // default
  }

  private extractPreferences(input: string): any {
    const preferences: any = {};
    
    // Workout frequency
    const workoutMatch = input.match(/(\d+)\s*(?:times?|days?)\s*(?:a\s+)?week/i);
    if (workoutMatch) {
      preferences.workoutDaysPerWeek = parseInt(workoutMatch[1]);
    }
    
    // Diet preferences
    if (/vegetarian/i.test(input)) preferences.diet = 'vegetarian';
    if (/vegan/i.test(input)) preferences.diet = 'vegan';
    if (/keto/i.test(input)) preferences.diet = 'keto';
    if (/low\s*carb/i.test(input)) preferences.diet = 'low_carb';
    
    // Time constraints
    const timeMatch = input.match(/(\d+)\s*hours?\s*(?:a\s+)?day/i);
    if (timeMatch) {
      preferences.availableHoursPerDay = parseInt(timeMatch[1]);
    }
    
    return preferences;
  }

  // Enhanced function call parsing with planning support
  private parseFunctionCalls(functionCalls: any[]): GPTAction[] {
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

  // Enhanced module determination with planning context
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

    // Special handling for comprehensive planning
    const hasComprehensivePlan = actions.some(a => 
      a.functionName?.includes('comprehensive') || 
      a.functionName?.includes('weekly_plan') ||
      a.functionName?.includes('smart_schedule')
    );
    
    if (hasComprehensivePlan) return 'timeline';

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
