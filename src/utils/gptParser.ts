
export interface ParsedResponse {
  message: string;
  actions: GPTAction[];
  activeModule: string | null;
  data: any;
}

export interface GPTAction {
  type: 'create' | 'update' | 'delete' | 'list';
  module: 'meals' | 'tasks' | 'workouts' | 'reminders' | 'time_blocks';
  data?: any;
  id?: string;
}

export class GPTParser {
  async processInput(input: string): Promise<ParsedResponse> {
    const response = await fetch('http://localhost:5000/api/gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        input,
        functions: this.getAvailableFunctions()
      })
    });

    const json = await response.json();

    // Parse function calls from GPT response
    const actions = this.parseFunctionCalls(json.function_calls || []);
    
    return {
      message: json.message,
      actions,
      activeModule: this.determineActiveModule(actions),
      data: json.data || {}
    };
  }

  private getAvailableFunctions() {
    return [
      {
        name: "create_meal",
        description: "Create a new meal entry",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the meal" },
            meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
            planned_date: { type: "string", description: "Date in YYYY-MM-DD format" },
            calories: { type: "number", description: "Estimated calories" },
            ingredients: { type: "array", items: { type: "string" } },
            instructions: { type: "string", description: "Cooking instructions" }
          },
          required: ["name"]
        }
      },
      {
        name: "create_task",
        description: "Create a new task",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Task title" },
            description: { type: "string", description: "Task description" },
            due_date: { type: "string", description: "Due date in YYYY-MM-DD format" }
          },
          required: ["title"]
        }
      },
      {
        name: "create_workout",
        description: "Create a new workout",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "Workout name" },
            duration: { type: "number", description: "Duration in minutes" },
            intensity: { type: "string", enum: ["low", "medium", "high"] },
            shceduled_date: { type: "string", description: "Scheduled date in YYYY-MM-DD format" }
          },
          required: ["name"]
        }
      },
      {
        name: "create_reminder",
        description: "Create a new reminder",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Reminder title" },
            due_date: { type: "string", description: "Due date and time" }
          },
          required: ["title"]
        }
      },
      {
        name: "create_time_block",
        description: "Create a time block for scheduling",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Time block title" },
            start_time: { type: "string", description: "Start time" },
            end_time: { type: "string", description: "End time" },
            category: { type: "string", description: "Category of the time block" }
          },
          required: ["title"]
        }
      }
    ];
  }

  private parseFunctionCalls(functionCalls: any[]): GPTAction[] {
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
        default:
          return { type: 'create', module: 'tasks', data: {} };
      }
    });
  }

  private determineActiveModule(actions: GPTAction[]): string | null {
    if (actions.length === 0) return null;
    return actions[0].module;
  }
}

export const gptParser = new GPTParser();
