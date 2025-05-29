
export interface Meal {
  id: string;
  user_id: string;
  name: string;
  ingredients?: any;
  instructions?: string;
  calories?: number;
  planned_date?: string;
  meal_type?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  is_completed?: boolean;
  created_at?: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name?: string;
  duration?: number;
  intensity?: string;
  is_completed?: boolean;
  shceduled_date?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id?: string;
  title?: string;
  due_date?: string;
  is_completed?: boolean;
  created_at: string;
}

export interface TimeBlock {
  id: string;
  user_id?: string;
  title?: string;
  start_time?: string;
  end_time?: string;
  category?: string;
  linked_task_id?: string;
  created_at: string;
}

export type CreateMeal = Omit<Meal, 'id' | 'created_at'>;
export type UpdateMeal = Partial<CreateMeal>;

export type CreateTask = Omit<Task, 'id' | 'created_at'>;
export type UpdateTask = Partial<CreateTask>;

export type CreateWorkout = Omit<Workout, 'id' | 'created_at'>;
export type UpdateWorkout = Partial<CreateWorkout>;

export type CreateReminder = Omit<Reminder, 'id' | 'created_at'>;
export type UpdateReminder = Partial<CreateReminder>;

export type CreateTimeBlock = Omit<TimeBlock, 'id' | 'created_at'>;
export type UpdateTimeBlock = Partial<CreateTimeBlock>;
