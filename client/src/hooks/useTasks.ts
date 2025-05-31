
import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  is_completed?: boolean;
  created_at?: string;
  user_id: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setTasks([
      {
        id: '1',
        title: 'Complete project',
        description: 'Finish the life flow app',
        due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        is_completed: false,
        user_id: '1'
      },
      {
        id: '2',
        title: 'Overdue task',
        description: 'This task is overdue',
        due_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        is_completed: false,
        user_id: '1'
      }
    ]);
    setLoading(false);
  }, []);

  const pendingTasks = tasks.filter(task => !task.is_completed);
  const overdueTasks = tasks.filter(task => 
    !task.is_completed && 
    task.due_date && 
    new Date(task.due_date) < new Date()
  );

  return {
    tasks,
    pendingTasks,
    overdueTasks,
    loading
  };
};
