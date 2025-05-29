
import { supabase } from './client';
import { TimeBlock, CreateTimeBlock, UpdateTimeBlock } from '@/types/database';

export const timeBlocksApi = {
  async create(timeBlock: CreateTimeBlock): Promise<TimeBlock> {
    const { data, error } = await supabase
      .from('time_blocks')
      .insert(timeBlock)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll(userId?: string): Promise<TimeBlock[]> {
    let query = supabase.from('time_blocks').select('*').order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<TimeBlock | null> {
    const { data, error } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<TimeBlock[]> {
    const { data, error } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate)
      .lte('end_time', endDate)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getByDate(userId: string, date: string): Promise<TimeBlock[]> {
    const startOfDay = `${date} 00:00:00`;
    const endOfDay = `${date} 23:59:59`;
    
    const { data, error } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getByCategory(userId: string, category: string): Promise<TimeBlock[]> {
    const { data, error } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getLinkedToTask(taskId: string): Promise<TimeBlock[]> {
    const { data, error } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('linked_task_id', taskId)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: UpdateTimeBlock): Promise<TimeBlock> {
    const { data, error } = await supabase
      .from('time_blocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('time_blocks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
