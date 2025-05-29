
import { supabase } from './client';
import { Reminder, CreateReminder, UpdateReminder } from '@/types/database';

export const remindersApi = {
  async create(reminder: CreateReminder): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .insert(reminder)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll(userId?: string): Promise<Reminder[]> {
    let query = supabase.from('reminders').select('*').order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Reminder | null> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getPending(userId: string): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getCompleted(userId: string): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getOverdue(userId: string): Promise<Reminder[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .lt('due_date', now)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: UpdateReminder): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async markComplete(id: string): Promise<Reminder> {
    return this.update(id, { is_completed: true });
  },

  async markIncomplete(id: string): Promise<Reminder> {
    return this.update(id, { is_completed: false });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
