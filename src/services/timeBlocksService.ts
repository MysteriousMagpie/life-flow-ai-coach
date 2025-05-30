
import { supabase } from '@/integrations/supabase/client';
import { TimeBlock, CreateTimeBlock, UpdateTimeBlock } from '@/types/database';

export const timeBlocksService = {
  async getAll(): Promise<TimeBlock[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
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

  async create(timeBlock: CreateTimeBlock): Promise<TimeBlock> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const timeBlockWithUserId = { ...timeBlock, user_id: user.id };
    
    const { data, error } = await supabase
      .from('time_blocks')
      .insert(timeBlockWithUserId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
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
