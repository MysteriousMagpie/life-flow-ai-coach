
import { useState, useEffect } from 'react';

interface Reminder {
  id: string;
  title?: string;
  due_date?: string;
  is_completed?: boolean;
  created_at?: string;
  user_id?: string;
}

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setReminders([
      {
        id: '1',
        title: 'Call dentist',
        due_date: new Date().toISOString(),
        is_completed: false,
        user_id: '1'
      }
    ]);
    setLoading(false);
  }, []);

  return {
    reminders,
    loading
  };
};
