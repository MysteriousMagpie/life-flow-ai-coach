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
  // Enhanced comprehensive planning functions
  {
    name: "generate_weekly_plan",
    description: "Generate a comprehensive weekly plan based on user goals and preferences",
    parameters: {
      type: "object",
      properties: {
        goals: {
          type: "array",
          items: { type: "string" },
          description: "User's goals (improve_nutrition, increase_fitness, productivity, etc.)"
        },
        preferences: {
          type: "object",
          properties: {
            workout_days_per_week: { type: "number" },
            diet_type: { type: "string" },
            available_hours_per_day: { type: "number" },
            preferred_workout_time: { type: "string" },
            meal_prep_preference: { type: "string" }
          }
        },
        constraints: {
          type: "array",
          items: { type: "string" },
          description: "Any scheduling constraints or limitations"
        },
        current_schedule: {
          type: "array",
          items: { type: "object" },
          description: "Existing commitments to work around"
        }
      },
      required: ["goals"]
    }
  },
  {
    name: "create_comprehensive_meal_plan",
    description: "Create a detailed meal plan with nutrition optimization",
    parameters: {
      type: "object",
      properties: {
        duration_days: { type: "number", description: "Number of days to plan for" },
        dietary_preferences: { 
          type: "array", 
          items: { type: "string" },
          description: "Dietary preferences or restrictions"
        },
        target_calories_per_day: { type: "number" },
        macro_goals: {
          type: "object",
          properties: {
            protein_percent: { type: "number" },
            carb_percent: { type: "number" },
            fat_percent: { type: "number" }
          }
        },
        meal_prep_style: { 
          type: "string",
          enum: ["daily_fresh", "weekly_prep", "mixed"],
          description: "Meal preparation preference"
        },
        budget_constraint: { type: "string" },
        cooking_skill_level: { 
          type: "string",
          enum: ["beginner", "intermediate", "advanced"]
        }
      },
      required: ["duration_days", "target_calories_per_day"]
    }
  },
  {
    name: "create_fitness_program",
    description: "Create a structured fitness program based on goals and experience",
    parameters: {
      type: "object",
      properties: {
        fitness_goals: {
          type: "array",
          items: { type: "string" },
          description: "Primary fitness goals (weight_loss, muscle_gain, endurance, etc.)"
        },
        experience_level: {
          type: "string",
          enum: ["beginner", "intermediate", "advanced"],
          description: "Current fitness experience level"
        },
        available_days: {
          type: "number",
          description: "Days per week available for workouts"
        },
        session_duration: {
          type: "number",
          description: "Preferred workout duration in minutes"
        },
        equipment_access: {
          type: "array",
          items: { type: "string" },
          description: "Available equipment (gym, home_weights, bodyweight, etc.)"
        },
        injury_considerations: {
          type: "array",
          items: { type: "string" },
          description: "Any injuries or physical limitations"
        },
        preferred_workout_types: {
          type: "array",
          items: { type: "string" },
          description: "Preferred types of exercise"
        }
      },
      required: ["fitness_goals", "available_days"]
    }
  },
  {
    name: "create_smart_schedule",
    description: "Create an optimized daily/weekly schedule considering priorities and energy levels",
    parameters: {
      type: "object",
      properties: {
        tasks_to_schedule: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              estimated_duration: { type: "number" },
              priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
              energy_required: { type: "string", enum: ["low", "medium", "high"] },
              preferred_time: { type: "string" },
              deadline: { type: "string" }
            }
          }
        },
        working_hours: {
          type: "object",
          properties: {
            start: { type: "string" },
            end: { type: "string" }
          }
        },
        energy_patterns: {
          type: "object",
          properties: {
            peak_hours: { type: "array", items: { type: "string" } },
            low_energy_hours: { type: "array", items: { type: "string" } }
          }
        },
        break_preferences: {
          type: "object",
          properties: {
            frequency_minutes: { type: "number" },
            duration_minutes: { type: "number" }
          }
        }
      },
      required: ["tasks_to_schedule"]
    }
  },
  {
    name: "reschedule_event",
    description: "Reschedule an existing event due to conflicts or changes",
    parameters: {
      type: "object",
      properties: {
        event_id: { type: "string", description: "ID of the event to reschedule" },
        new_time: { type: "string", description: "New date/time for the event" },
        reason: { type: "string", description: "Reason for rescheduling" },
        find_alternatives: { 
          type: "boolean", 
          description: "Whether to suggest alternative times if new time conflicts"
        },
        notify_related: {
          type: "boolean",
          description: "Whether to update related events/reminders"
        }
      },
      required: ["event_id", "new_time"]
    }
  },
  {
    name: "handle_missed_activity",
    description: "Handle when user reports missing an activity and suggest alternatives",
    parameters: {
      type: "object",
      properties: {
        activity_type: { 
          type: "string",
          enum: ["workout", "meal", "task", "appointment"],
          description: "Type of activity that was missed"
        },
        activity_id: { type: "string", description: "ID of the missed activity" },
        reason: { type: "string", description: "Why the activity was missed" },
        reschedule_preference: {
          type: "string",
          enum: ["today", "tomorrow", "this_week", "next_available"],
          description: "When to reschedule"
        },
        modify_future: {
          type: "boolean",
          description: "Whether to adjust future similar activities"
        }
      },
      required: ["activity_type", "activity_id"]
    }
  },

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
          content: `You are a highly intelligent AI life planning assistant that excels at creating comprehensive, personalized plans for users' daily lives.

Your expertise includes:
- Creating detailed meal plans optimized for nutrition and lifestyle
- Designing fitness programs tailored to individual goals and constraints  
- Smart scheduling that considers energy levels, priorities, and time management
- Handling schedule changes and conflicts gracefully
- Providing adaptive suggestions when plans need adjustment

When users express goals like "help me eat better and get to the gym," you should:
1. Use generate_weekly_plan to create a comprehensive approach
2. Use create_comprehensive_meal_plan for detailed nutrition planning
3. Use create_fitness_program for structured workout routines
4. Use create_smart_schedule to integrate everything into their calendar
5. Use reschedule_event and handle_missed_activity for adjustments

For planning requests, always:
- Ask clarifying questions if important details are missing
- Consider user's lifestyle, constraints, and preferences
- Create realistic, achievable plans
- Provide specific, actionable recommendations
- Build in flexibility for adjustments

Available function categories:
- Comprehensive Planning: generate_weekly_plan, create_comprehensive_meal_plan, create_fitness_program, create_smart_schedule
- Schedule Management: reschedule_event, handle_missed_activity
- Basic Operations: create_meal, create_task, create_workout, create_reminder, create_time_block
- Information Retrieval: list_meals, list_tasks, list_reminders
- Optimization: optimize_schedule, analyze_progress, generate_suggestions

Be encouraging, supportive, and focus on sustainable lifestyle improvements.`
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
