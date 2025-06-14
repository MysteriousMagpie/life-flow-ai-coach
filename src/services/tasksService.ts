
import { supabase } from '@/integrations/supabase';
import { Task, CreateTask, UpdateTask } from '@/types/database';

export const tasksService = {
  async getAll(): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
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

  async getCompleted(): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getPending(): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getOverdue(): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .lt('due_date', now)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(task: CreateTask): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const taskWithUserId = { ...task, user_id: user.id };
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskWithUserId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
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

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async markComplete(id: string): Promise<Task> {
    return this.update(id, { is_completed: true });
  },

  async markIncomplete(id: string): Promise<Task> {
    return this.update(id, { is_completed: false });
  }
};
