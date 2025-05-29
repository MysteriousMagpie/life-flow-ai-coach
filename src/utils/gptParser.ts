
export interface ParsedResponse {
  message: string;
  actions: GPTAction[];
  activeModule: string | null;
  data: any;
}

export interface GPTAction {
  type: 'create' | 'update' | 'delete' | 'list' | 'complete' | 'incomplete';
  module: 'meals' | 'tasks' | 'workouts' | 'reminders' | 'time_blocks';
  data?: any;
  id?: string;
}

export class GPTParser {
  async processInput(input: string): Promise<ParsedResponse> {
    try {
      const response = await fetch('http://localhost:5000/api/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input,
          functions: this.getAvailableFunctions()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      // Parse function calls from GPT response
      const actions = this.parseFunctionCalls(json.function_calls || []);
      
      return {
        message: json.message || "I'm here to help you plan your life!",
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

  private getAvailableFunctions() {
    return [
      {
        name: "create_meal",
        description: "Create a new meal entry for meal planning",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the meal" },
            meal_type: { 
              type: "string", 
              enum: ["breakfast", "lunch", "dinner", "snack"],
              description: "Type of meal"
            },
            planned_date: { 
              type: "string", 
              description: "Date in YYYY-MM-DD format when the meal is planned"
            },
            calories: { 
              type: "number", 
              description: "Estimated calories for the meal"
            },
            ingredients: { 
              type: "array", 
              items: { type: "string" },
              description: "List of ingredients needed"
            },
            instructions: { 
              type: "string", 
              description: "Cooking or preparation instructions"
            }
          },
          required: ["name"]
        }
      },
      {
        name: "create_task",
        description: "Create a new task for task management. Use this for any work items, personal tasks, or activities that need to be completed.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Task title or name" },
            description: { type: "string", description: "Detailed description of the task" },
            due_date: { 
              type: "string", 
              description: "Due date in YYYY-MM-DD format"
            },
            is_completed: {
              type: "boolean",
              description: "Whether the task is completed",
              default: false
            }
          },
          required: ["title"]
        }
      },
      {
        name: "create_workout",
        description: "Create a new workout for fitness planning",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "Workout name or type" },
            duration: { 
              type: "number", 
              description: "Duration in minutes"
            },
            intensity: { 
              type: "string", 
              enum: ["low", "medium", "high"],
              description: "Workout intensity level"
            },
            shceduled_date: { 
              type: "string", 
              description: "Scheduled date in YYYY-MM-DD format"
            },
            is_completed: {
              type: "boolean",
              description: "Whether the workout is completed",
              default: false
            }
          },
          required: ["name"]
        }
      },
      {
        name: "create_reminder",
        description: "Create a new reminder for important tasks or events",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Reminder title" },
            due_date: { 
              type: "string", 
              description: "Due date and time in ISO format or YYYY-MM-DD"
            },
            is_completed: {
              type: "boolean",
              description: "Whether the reminder is completed",
              default: false
            }
          },
          required: ["title"]
        }
      },
      {
        name: "create_time_block",
        description: "Create a time block for scheduling activities",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Time block title or activity name" },
            start_time: { 
              type: "string", 
              description: "Start time in HH:MM format or full datetime"
            },
            end_time: { 
              type: "string", 
              description: "End time in HH:MM format or full datetime"
            },
            category: { 
              type: "string", 
              description: "Category of the time block (work, personal, exercise, etc.)"
            },
            linked_task_id: {
              type: "string",
              description: "Optional ID of a related task"
            }
          },
          required: ["title"]
        }
      },
      {
        name: "complete_task",
        description: "Mark a task as completed",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string", description: "Task ID to complete" }
          },
          required: ["id"]
        }
      },
      {
        name: "complete_workout",
        description: "Mark a workout as completed",
        parameters: {
          type: "object",
          properties: {
            id: { type: "string", description: "Workout ID to complete" }
          },
          required: ["id"]
        }
      },
      {
        name: "list_tasks",
        description: "List all tasks or filter by status",
        parameters: {
          type: "object",
          properties: {
            status: { 
              type: "string", 
              enum: ["all", "pending", "completed", "overdue"],
              description: "Filter tasks by status"
            }
          }
        }
      },
      {
        name: "list_meals",
        description: "List meals, optionally filtered by date or meal type",
        parameters: {
          type: "object",
          properties: {
            date: { 
              type: "string", 
              description: "Date to filter meals in YYYY-MM-DD format"
            },
            meal_type: {
              type: "string",
              enum: ["breakfast", "lunch", "dinner", "snack"],
              description: "Filter by meal type"
            }
          }
        }
      },
      {
        name: "analyze_progress",
        description: "Analyze user's progress and provide insights",
        parameters: {
          type: "object",
          properties: {
            timeframe: {
              type: "string",
              enum: ["day", "week", "month"],
              description: "Timeframe for analysis"
            },
            focus_area: {
              type: "string",
              enum: ["tasks", "workouts", "meals", "overall"],
              description: "Specific area to analyze"
            }
          }
        }
      }
    ];
  }

  private parseFunctionCalls(functionCalls: any[]): GPTAction[] {
    if (!Array.isArray(functionCalls)) return [];

    return functionCalls.map(call => {
      const { name, arguments: args } = call;
      
      switch (name) {
        case 'create_meal':
          return { type: 'create', module: 'meals', data: args };
        case 'create_task':
          return { type: 'create', module: 'tasks', data: args };
        case 'create_workout':
          return { type: 'create', module: 'workouts', data: args };
        case 'create_reminder':
          return { type: 'create', module: 'reminders', data: args };
        case 'create_time_block':
          return { type: 'create', module: 'time_blocks', data: args };
        case 'complete_task':
          return { type: 'complete', module: 'tasks', id: args.id };
        case 'complete_workout':
          return { type: 'complete', module: 'workouts', id: args.id };
        case 'list_tasks':
          return { type: 'list', module: 'tasks', data: args };
        case 'list_meals':
          return { type: 'list', module: 'meals', data: args };
        case 'analyze_progress':
          // This doesn't map to a specific action but can be handled in the response
          return { type: 'list', module: 'tasks', data: { analyze: true, ...args } };
        default:
          console.warn(`Unknown function call: ${name}`);
          return { type: 'create', module: 'tasks', data: {} };
      }
    });
  }

  private determineActiveModule(actions: GPTAction[]): string | null {
    if (actions.length === 0) return null;
    
    // Find the most relevant module from actions
    const moduleCount = actions.reduce((acc, action) => {
      acc[action.module] = (acc[action.module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(moduleCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
  }
}

export const gptParser = new GPTParser();
