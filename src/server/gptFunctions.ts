
export interface GPTFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export const gptFunctions: GPTFunction[] = [
  {
    name: "createMeal",
    description: "Create a new meal entry for meal planning",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the meal"
        },
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
    name: "scheduleWorkout",
    description: "Schedule a new workout session",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Workout name or type"
        },
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
        workout_type: {
          type: "string",
          enum: ["cardio", "strength", "flexibility", "sports", "mixed"],
          description: "Type of workout"
        },
        exercises: {
          type: "array",
          items: { type: "string" },
          description: "List of exercises in the workout"
        }
      },
      required: ["name"]
    }
  },
  {
    name: "addTask",
    description: "Add a new task to the task list",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Task title or name"
        },
        description: {
          type: "string",
          description: "Detailed description of the task"
        },
        due_date: {
          type: "string",
          description: "Due date in YYYY-MM-DD format"
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "urgent"],
          description: "Task priority level"
        }
      },
      required: ["title"]
    }
  },
  {
    name: "addReminder",
    description: "Add a new reminder",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Reminder title"
        },
        due_date: {
          type: "string",
          description: "Due date and time in ISO format or YYYY-MM-DD"
        },
        reminder_type: {
          type: "string",
          enum: ["appointment", "medication", "call", "task", "event", "other"],
          description: "Type of reminder"
        }
      },
      required: ["title"]
    }
  },
  {
    name: "createTimeBlock",
    description: "Create a time block for scheduling activities",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Time block title or activity name"
        },
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
  }
];
