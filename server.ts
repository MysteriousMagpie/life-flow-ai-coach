
import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function definitions for all core modules
const functions = [
  // Meals module functions
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
    name: "create_meal_plan",
    description: "Create a comprehensive meal plan for multiple days",
    parameters: {
      type: "object",
      properties: {
        duration_days: { type: "number", description: "Number of days to plan for" },
        dietary_preferences: { 
          type: "array", 
          items: { type: "string" },
          description: "Dietary preferences or restrictions"
        },
        target_calories_per_day: { type: "number", description: "Target daily calorie intake" },
        start_date: { type: "string", description: "Start date in YYYY-MM-DD format" }
      },
      required: ["duration_days"]
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
        },
        week_range: {
          type: "boolean",
          description: "Show meals for the current week"
        }
      }
    }
  },

  // Tasks module functions
  {
    name: "create_task",
    description: "Create a new task for task management",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Task title or name" },
        description: { type: "string", description: "Detailed description of the task" },
        due_date: { 
          type: "string", 
          description: "Due date in YYYY-MM-DD format"
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "urgent"],
          description: "Task priority level"
        },
        category: {
          type: "string",
          description: "Task category (work, personal, health, etc.)"
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
    name: "list_tasks",
    description: "List all tasks or filter by status",
    parameters: {
      type: "object",
      properties: {
        status: { 
          type: "string", 
          enum: ["all", "pending", "completed", "overdue"],
          description: "Filter tasks by status"
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "urgent"],
          description: "Filter by priority level"
        },
        category: {
          type: "string",
          description: "Filter by category"
        }
      }
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
    name: "update_task_priority",
    description: "Update the priority of an existing task",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Task ID to update" },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "urgent"],
          description: "New priority level"
        }
      },
      required: ["id", "priority"]
    }
  },

  // Workouts module functions
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
        scheduled_date: { 
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
    name: "create_workout_plan",
    description: "Create a comprehensive workout plan for multiple days",
    parameters: {
      type: "object",
      properties: {
        duration_weeks: { type: "number", description: "Number of weeks to plan for" },
        fitness_goals: {
          type: "array",
          items: { type: "string" },
          description: "Fitness goals (weight loss, muscle gain, endurance, etc.)"
        },
        sessions_per_week: { type: "number", description: "Number of workout sessions per week" },
        preferred_workout_types: {
          type: "array",
          items: { 
            type: "string",
            enum: ["cardio", "strength", "flexibility", "sports", "mixed"]
          },
          description: "Preferred types of workouts"
        }
      },
      required: ["duration_weeks", "sessions_per_week"]
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

  // Reminders module functions
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
        reminder_type: {
          type: "string",
          enum: ["appointment", "medication", "call", "task", "event", "other"],
          description: "Type of reminder"
        },
        recurring: {
          type: "string",
          enum: ["none", "daily", "weekly", "monthly"],
          description: "Recurring pattern"
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
    name: "list_reminders",
    description: "List reminders, optionally filtered by status or date",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["pending", "completed", "overdue"],
          description: "Filter by reminder status"
        },
        type: {
          type: "string",
          enum: ["appointment", "medication", "call", "task", "event", "other"],
          description: "Filter by reminder type"
        },
        date_range: {
          type: "string",
          enum: ["today", "tomorrow", "this_week", "next_week"],
          description: "Filter by date range"
        }
      }
    }
  },

  // Time blocks module functions
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
        date: {
          type: "string",
          description: "Date for the time block in YYYY-MM-DD format"
        },
        category: { 
          type: "string", 
          description: "Category of the time block (work, personal, exercise, etc.)"
        },
        linked_task_id: {
          type: "string",
          description: "Optional ID of a related task"
        },
        color: {
          type: "string",
          description: "Color code for visual representation"
        }
      },
      required: ["title"]
    }
  },
  {
    name: "optimize_schedule",
    description: "Analyze and optimize the user's schedule",
    parameters: {
      type: "object",
      properties: {
        date_range: {
          type: "string",
          enum: ["today", "tomorrow", "this_week", "next_week"],
          description: "Time range to optimize"
        },
        focus_areas: {
          type: "array",
          items: { type: "string" },
          description: "Areas to focus optimization on (productivity, balance, health, etc.)"
        },
        constraints: {
          type: "array",
          items: { type: "string" },
          description: "Scheduling constraints to consider"
        }
      },
      required: ["date_range"]
    }
  },

  // Analysis and insights functions
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
          enum: ["tasks", "workouts", "meals", "overall", "productivity"],
          description: "Specific area to analyze"
        },
        metrics: {
          type: "array",
          items: { type: "string" },
          description: "Specific metrics to analyze"
        }
      }
    }
  },
  {
    name: "generate_suggestions",
    description: "Generate smart suggestions for life planning improvements",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["productivity", "health", "schedule", "habits", "goals"],
          description: "Category of suggestions to generate"
        },
        user_context: {
          type: "string",
          description: "Current user context or situation"
        }
      },
      required: ["category"]
    }
  }
];

app.post('/api/gpt', async (req, res) => {
  const { input } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      message: 'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.',
      function_calls: []
    });
  }

  try {
    console.log('[GPT REQUEST]', { input, functionsCount: functions.length });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: `You are a helpful AI life planning assistant specialized in helping users manage their daily life through meals, tasks, workouts, reminders, and time blocking.

Your role is to:
1. Understand user requests for creating, managing, or querying their life planning data
2. Use the available functions to perform actions when appropriate
3. Provide helpful, actionable advice and confirmations
4. Be proactive in suggesting improvements to their planning

When users ask you to create items, always use the appropriate functions. When they ask about existing items, use list functions if available.

Available function categories:
- Meals: create_meal, create_meal_plan, list_meals
- Tasks: create_task, list_tasks, complete_task, update_task_priority
- Workouts: create_workout, create_workout_plan, complete_workout
- Reminders: create_reminder, list_reminders
- Time Blocks: create_time_block, optimize_schedule
- Analysis: analyze_progress, generate_suggestions

Be conversational, encouraging, and focus on helping them build better habits and organization.`
        },
        { role: 'user', content: input }
      ],
      functions: functions,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 1000
    });

    const message = completion.choices[0].message;
    const content = message.content || 'I\'m here to help you plan your life better!';
    
    // Handle function calls
    const functionCalls = [];
    if (message.function_call) {
      try {
        const parsedArgs = JSON.parse(message.function_call.arguments || '{}');
        functionCalls.push({
          name: message.function_call.name,
          arguments: parsedArgs
        });
      } catch (parseError) {
        console.error('[FUNCTION PARSE ERROR]', parseError);
      }
    }

    console.log('[GPT RESPONSE]', { 
      content: content.substring(0, 100) + '...', 
      functionCalls: functionCalls.length 
    });

    res.json({ 
      message: content,
      function_calls: functionCalls
    });
  } catch (error) {
    console.error('[GPT ERROR]', error);
    
    let errorMessage = 'I encountered an error while processing your request.';
    if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded. Please check your billing settings.';
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key. Please check your configuration.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      function_calls: []
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    openai_configured: !!process.env.OPENAI_API_KEY,
    functions_available: functions.length
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📡 OpenAI API configured: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`🔧 Functions available: ${functions.length}`);
});
