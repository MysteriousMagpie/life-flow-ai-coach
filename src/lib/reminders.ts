
import { Task, Reminder } from '@/types/database';
import { format, parseISO } from 'date-fns';

export interface ReminderEntry {
  id: string;
  title: string;
  notes?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  list?: string;
}

export class RemindersGenerator {
  static tasksToAppleReminders(tasks: Task[]): ReminderEntry[] {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      notes: task.description || undefined,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      priority: this.determinePriority(task),
      completed: task.is_completed || false,
      list: 'Life Planning Tasks'
    }));
  }

  static remindersToAppleReminders(reminders: Reminder[]): ReminderEntry[] {
    return reminders.map(reminder => ({
      id: reminder.id,
      title: reminder.title || 'Reminder',
      dueDate: reminder.due_date ? new Date(reminder.due_date) : undefined,
      priority: 'medium',
      completed: reminder.is_completed || false,
      list: 'Life Planning Reminders'
    }));
  }

  private static determinePriority(task: Task): 'low' | 'medium' | 'high' {
    if (!task.due_date) return 'low';
    
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) return 'high';
    if (daysDiff <= 3) return 'medium';
    return 'low';
  }

  static generateAppleRemindersURL(entries: ReminderEntry[]): string {
    // Apple Reminders URL scheme for adding reminders
    const baseURL = 'x-apple-reminderkit://REMCDReminder';
    
    // For multiple reminders, we'll create a simple text format
    const reminderText = entries.map(entry => {
      const parts = [entry.title];
      if (entry.dueDate) {
        parts.push(`Due: ${format(entry.dueDate, 'MMM dd, yyyy')}`);
      }
      if (entry.notes) {
        parts.push(`Notes: ${entry.notes}`);
      }
      return parts.join(' - ');
    }).join('\n');

    return `${baseURL}?title=${encodeURIComponent('Life Planning Tasks')}&notes=${encodeURIComponent(reminderText)}`;
  }

  static generateGoodTaskFormat(entries: ReminderEntry[]): string {
    return entries.map(entry => {
      const parts = [`[] ${entry.title}`];
      
      if (entry.dueDate) {
        parts.push(`@due(${format(entry.dueDate, 'yyyy-MM-dd')})`);
      }
      
      if (entry.priority === 'high') {
        parts.push('@high');
      } else if (entry.priority === 'medium') {
        parts.push('@medium');
      }
      
      if (entry.notes) {
        parts.push(`\n  Notes: ${entry.notes}`);
      }
      
      return parts.join(' ');
    }).join('\n\n');
  }

  static downloadReminders(content: string, filename: string, format: 'txt' | 'json' = 'txt'): void {
    const mimeType = format === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
