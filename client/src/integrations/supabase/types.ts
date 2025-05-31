
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      meals: {
        Row: {
          calories: number | null
          created_at: string
          id: string
          ingredients: Json | null
          instructions: string | null
          meal_type: string | null
          name: string
          planned_date: string | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          created_at?: string
          id?: string
          ingredients?: Json | null
          instructions?: string | null
          meal_type?: string | null
          name: string
          planned_date?: string | null
          user_id: string
        }
        Update: {
          calories?: number | null
          created_at?: string
          id?: string
          ingredients?: Json | null
          instructions?: string | null
          meal_type?: string | null
          name?: string
          planned_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          is_completed: boolean | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      time_blocks: {
        Row: {
          category: string | null
          created_at: string
          end_time: string | null
          id: string
          linked_task_id: string | null
          start_time: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          linked_task_id?: string | null
          start_time?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          linked_task_id?: string | null
          start_time?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          duration: number | null
          id: string
          intensity: string | null
          is_completed: boolean | null
          name: string | null
          shceduled_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          id?: string
          intensity?: string | null
          is_completed?: boolean | null
          name?: string | null
          shceduled_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          id?: string
          intensity?: string | null
          is_completed?: boolean | null
          name?: string | null
          shceduled_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
