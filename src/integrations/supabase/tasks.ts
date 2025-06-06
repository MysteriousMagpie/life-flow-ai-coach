
import { supabase } from './client';
import { Task, CreateTask, UpdateTask } from '@/types/database';

export const tasksApi = {
  async create(task: CreateTask): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll(userId?: string): Promise<Task[]> {
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getCompleted(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getPending(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getOverdue(userId: string): Promise<Task[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .lt('due_date', now)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: UpdateTask): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async markComplete(id: string): Promise<Task> {
    return this.update(id, { is_completed: true });
  },

  async markIncomplete(id: string): Promise<Task> {
    return this.update(id, { is_completed: false });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
