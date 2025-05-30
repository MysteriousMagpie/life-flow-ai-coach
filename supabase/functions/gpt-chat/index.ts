
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

    const openai = new OpenAI({ apiKey: openaiApiKey })

    console.log('[GPT REQUEST]', { message, userId, messagesCount: messages?.length })

    let conversationMessages: any[] = []
    
    // Handle both legacy single message and new messages array format
    // Check if messages array exists and has content
    if (messages && Array.isArray(messages) && messages.length > 0) {
      conversationMessages = messages
    } else {
      // For first message or when messages array is empty, create new conversation
      conversationMessages = [
        {
          role: "system",
          content: "You are a helpful life planning assistant. Help users organize their meals, workouts, tasks, reminders, and schedule. Be conversational and helpful."
        },
        { role: "user", content: message }
      ]
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversationMessages,
      temperature: 0.7
    })

    const assistantMessage = completion.choices[0].message

    const response = {
      message: assistantMessage.content || "I'm here to help you plan your life better!",
      actions: [],
      actionResults: [],
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
