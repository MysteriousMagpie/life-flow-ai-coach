
import { supabase } from './client';
import { Meal, CreateMeal, UpdateMeal } from '@/types/database';

export const mealsApi = {
  async create(meal: CreateMeal): Promise<Meal> {
    const { data, error } = await supabase
      .from('meals')
      .insert(meal)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll(userId?: string): Promise<Meal[]> {
    let query = supabase.from('meals').select('*').order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Meal | null> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('planned_date', startDate)
      .lte('planned_date', endDate)
      .order('planned_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getByMealType(userId: string, mealType: string): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .eq('meal_type', mealType)
      .order('planned_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getByDate(userId: string, date: string): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .eq('planned_date', date)
      .order('meal_type');
    
    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: UpdateMeal): Promise<Meal> {
    const { data, error } = await supabase
      .from('meals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
