
import { supabase } from '@/integrations/supabase/client';
import { Meal, CreateMeal, UpdateMeal } from '@/types/database';

export const mealsService = {
  async getAll(): Promise<Meal[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
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

  async getByDateRange(startDate: string, endDate: string): Promise<Meal[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .gte('planned_date', startDate)
      .lte('planned_date', endDate)
      .order('planned_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getByMealType(mealType: string): Promise<Meal[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .eq('meal_type', mealType)
      .order('planned_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getByDate(date: string): Promise<Meal[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .eq('planned_date', date)
      .order('meal_type');
    
    if (error) throw error;
    return data || [];
  },

  async create(meal: CreateMeal): Promise<Meal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const mealWithUserId = { ...meal, user_id: user.id };
    
    const { data, error } = await supabase
      .from('meals')
      .insert(mealWithUserId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
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
