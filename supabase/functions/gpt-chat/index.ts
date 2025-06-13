
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string
  messages?: any[]
  userId: string
}

// Define GPT tools/functions
const gptTools = [
  {
    type: "function" as const,
    function: {
      name: 'addMeal',
      description: 'Add a meal to the meal planner',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the meal' },
          meal_type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
          planned_date: { type: 'string', format: 'date', description: 'Date for the meal (YYYY-MM-DD)' },
          calories: { type: 'number', description: 'Estimated calories' },
          ingredients: { type: 'array', items: { type: 'string' }, description: 'List of ingredients' },
          instructions: { type: 'string', description: 'Cooking instructions' }
        },
        required: ['name', 'meal_type', 'planned_date']
      }
    }
  }
]

// Helper function to execute addMeal
async function addMeal(args: any, userId: string, supabase: any) {
  try {
    console.log('[ADD MEAL] Executing with args:', args);
    
    const mealData = {
      user_id: userId,
      name: args.name,
      meal_type: args.meal_type || 'breakfast',
      planned_date: args.planned_date,
      calories: args.calories || null,
      ingredients: args.ingredients ? JSON.stringify(args.ingredients) : null,
      instructions: args.instructions || null
    };

    const { data: meal, error } = await supabase
      .from('meals')
      .insert(mealData)
      .select()
      .single();

    if (error) throw error;

    console.log('[ADD MEAL] Successfully created meal:', meal);

    // Create time block for the meal
    if (args.meal_type && args.planned_date) {
      const mealTimes = {
        breakfast: '08:00',
        lunch: '12:30',
        dinner: '18:30',
        snack: '15:00'
      };

      const mealTime = mealTimes[args.meal_type] || '12:00';
      const [hours, minutes] = mealTime.split(':').map(Number);
      
      const startTime = new Date(args.planned_date);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      const timeBlockData = {
        user_id: userId,
        title: `${args.meal_type.charAt(0).toUpperCase() + args.meal_type.slice(1)}: ${args.name}`,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        category: 'meal'
      };

      await supabase.from('time_blocks').insert(timeBlockData);
      console.log('[ADD MEAL] Successfully created time block');
    }

    return { success: true, meal };
  } catch (error) {
    console.error('[ADD MEAL] Error:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, messages, userId }: ChatRequest = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ 
          message: 'Missing required field: userId',
          actions: [],
          actionResults: [],
          activeModule: null
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ 
          message: 'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.',
          actions: [],
          actionResults: [],
          activeModule: null
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const openai = new OpenAI({ apiKey: openaiApiKey })

    console.log('[GPT REQUEST]', { message, userId, messagesCount: messages?.length })

    let conversationMessages: any[] = []
    
    // Handle both legacy single message and new messages array format
    if (messages && Array.isArray(messages) && messages.length > 0) {
      conversationMessages = messages
    } else {
      conversationMessages = [
        {
          role: "system",
          content: "You are a helpful life planning assistant. You have the following tools: addMeal (store meals in meal planner). Use addMeal whenever a user asks to create, add, or schedule a meal. Help users organize their meals, workouts, tasks, reminders, and schedule."
        },
        { role: "user", content: message }
      ]
    }

    const executedActions: any[] = []
    const maxIterations = 10
    let iterations = 0

    // Tool-calling loop
    while (iterations < maxIterations) {
      console.log(`[GPT ITERATION ${iterations + 1}]`, { messagesCount: conversationMessages.length })

      const params = {
        model: "gpt-4o" as const,
        messages: conversationMessages,
        tools: gptTools,
        tool_choice: "auto" as const,
        temperature: 0.7
      }
      
      console.log('[EDGE-PAYLOAD]', { toolLen: params.tools?.length })

      const completion = await openai.chat.completions.create(params)
      const choice = completion.choices[0]
      
      console.log('[OPENAI] finish:', choice.finish_reason, 'tool_calls:', !!choice.message.tool_calls)

      // Tool call round
      if (choice.finish_reason === "tool_calls") {
        // Add assistant message with tool calls
        conversationMessages.push({
          role: "assistant",
          content: choice.message.content,
          tool_calls: choice.message.tool_calls
        })

        // Process each tool call
        for (const toolCall of choice.message.tool_calls || []) {
          if (toolCall.type === "function" && toolCall.function?.name === "addMeal") {
            try {
              console.log('[FUNCTION CALL] addMeal', toolCall.function.arguments)
              const args = JSON.parse(toolCall.function.arguments)
              await addMeal(args, userId, supabase)
              
              executedActions.push({
                function: "addMeal",
                arguments: args,
                result: { success: true }
              })

              // Add tool response
              conversationMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ status: "success", message: "Meal added successfully" })
              })

              console.log('[FUNCTION RESULT] addMeal success')
            } catch (error) {
              console.error('[FUNCTION ERROR] addMeal:', error)
              
              conversationMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ status: "error", message: error.message })
              })
            }
          }
        }
        
        iterations++
        continue // Loop again for natural language response
      } else {
        // Normal exit - send final assistant content to client
        console.log('[GPT COMPLETE]', { iterations, actionsExecuted: executedActions.length })
        
        const response = {
          message: choice.message.content || "I'm here to help you plan your life better!",
          actions: executedActions,
          actionResults: executedActions.map(action => action.result),
          activeModule: null
        }

        console.log('[GPT RESPONSE]', { 
          message: response.message?.substring(0, 100) + '...', 
          actionsCount: response.actions.length,
          resultsCount: response.actionResults.length
        })

        return new Response(
          JSON.stringify(response),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // If we hit max iterations, return what we have
    console.log('[GPT MAX ITERATIONS REACHED]', { iterations, actionsExecuted: executedActions.length })
    
    return new Response(
      JSON.stringify({
        message: "I've completed the requested actions, though the conversation may have been truncated due to complexity.",
        actions: executedActions,
        actionResults: executedActions.map(action => action.result),
        activeModule: null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[GPT ERROR]', error)
    
    let errorMessage = 'I encountered an error while processing your request.'
    if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded. Please check your billing settings.'
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key. Please check your configuration.'
    }
    
    return new Response(
      JSON.stringify({ 
        message: errorMessage,
        actions: [],
        actionResults: [],
        activeModule: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
