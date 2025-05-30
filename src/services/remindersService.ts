
import { supabase } from '@/integrations/supabase/client';
import { Reminder, CreateReminder, UpdateReminder } from '@/types/database';

export const remindersService = {
  async getAll(): Promise<Reminder[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
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

  async create(reminder: CreateReminder): Promise<Reminder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const reminderWithUserId = { ...reminder, user_id: user.id };
    
    const { data, error } = await supabase
      .from('reminders')
      .insert(reminderWithUserId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
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

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
