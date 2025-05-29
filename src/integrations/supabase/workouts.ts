
import { supabase } from './client';
import { Workout, CreateWorkout, UpdateWorkout } from '@/types/database';

export const workoutsApi = {
  async create(workout: CreateWorkout): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .insert(workout)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll(userId?: string): Promise<Workout[]> {
    let query = supabase.from('workouts').select('*').order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
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

  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('shceduled_date', startDate)
      .lte('shceduled_date', endDate)
      .order('shceduled_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getCompleted(userId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getPending(userId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('shceduled_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
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

  async markComplete(id: string): Promise<Workout> {
    return this.update(id, { is_completed: true });
  },

  async markIncomplete(id: string): Promise<Workout> {
    return this.update(id, { is_completed: false });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
