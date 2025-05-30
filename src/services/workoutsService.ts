
import { supabase } from '@/integrations/supabase/client';
import { Workout, CreateWorkout, UpdateWorkout } from '@/types/database';

export const workoutsService = {
  async getAll(): Promise<Workout[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Workout | null> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Workout[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .gte('shceduled_date', startDate)
      .lte('shceduled_date', endDate)
      .order('shceduled_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(workout: CreateWorkout): Promise<Workout> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const workoutWithUserId = { ...workout, user_id: user.id };
    
    const { data, error } = await supabase
      .from('workouts')
      .insert(workoutWithUserId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: UpdateWorkout): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async markComplete(id: string): Promise<Workout> {
    return this.update(id, { is_completed: true });
  },

  async markIncomplete(id: string): Promise<Workout> {
    return this.update(id, { is_completed: false });
  }
};
