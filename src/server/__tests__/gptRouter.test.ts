
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../integrations/supabase/client', () => {
  return {
    supabase: {
      auth: { getUser: vi.fn() },
      from: vi.fn()
    }
  };
});

import { supabase } from '../../integrations/supabase/client';
import { parseFunctionCall } from '../gptRouter';

const mockUser = { id: 'auth-user' };

// Mock Supabase client

describe('parseFunctionCall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addMeal', () => {
    it('should create a meal successfully', async () => {
      const mockMeal = {
        id: 'test-id',
        name: 'Test Meal',
        meal_type: 'breakfast',
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        planned_date: null,
        calories: null,
        ingredients: null,
        instructions: null
      };

      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockMeal, error: null })
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);

      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });

      const result = await parseFunctionCall('addMeal', {
        name: 'Test Meal',
        meal_type: 'breakfast'
      });

      expect(result.success).toBe(true);
      expect(result.meal).toEqual(mockMeal);
      expect(supabase.from).toHaveBeenCalledWith('meals');
      expect(mockFrom.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Meal',
          meal_type: 'breakfast',
          user_id: mockUser.id
        })
      );
    });

    it('should handle errors when creating a meal', async () => {
      const error = new Error('Database error');
      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(error)
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });

      const result = await parseFunctionCall('addMeal', {
        name: 'Test Meal'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unexpected error');
    });
  });

  describe('addWorkout', () => {
    it('should schedule a workout successfully', async () => {
      const mockWorkout = {
        id: 'test-id',
        name: 'Test Workout',
        duration: 30,
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        intensity: null,
        is_completed: false,
        shceduled_date: null
      };

      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockWorkout, error: null })
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });

      const result = await parseFunctionCall('addWorkout', {
        name: 'Test Workout',
        duration: 30
      });

      expect(result.success).toBe(true);
      expect(result.workout).toEqual(mockWorkout);
      expect(supabase.from).toHaveBeenCalledWith('workouts');
    });
  });

  describe('addTask', () => {
    it('should add a task successfully', async () => {
      const mockTask = {
        id: 'test-id',
        title: 'Test Task',
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        description: null,
        due_date: null,
        is_completed: false
      };

      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTask, error: null })
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });

      const result = await parseFunctionCall('addTask', {
        title: 'Test Task'
      });

      expect(result.success).toBe(true);
      expect(result.task).toEqual(mockTask);
      expect(supabase.from).toHaveBeenCalledWith('tasks');
    });
  });

  describe('addReminder', () => {
    it('should add a reminder successfully', async () => {
      const mockReminder = {
        id: 'test-id',
        title: 'Test Reminder',
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        due_date: null,
        is_completed: false
      };

      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockReminder, error: null })
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });

      const result = await parseFunctionCall('addReminder', {
        title: 'Test Reminder'
      });

      expect(result.success).toBe(true);
      expect(result.reminder).toEqual(mockReminder);
      expect(supabase.from).toHaveBeenCalledWith('reminders');
    });
  });

  describe('addTimeBlock', () => {
    it('should create a time block successfully', async () => {
      const mockTimeBlock = {
        id: 'test-id',
        title: 'Test Time Block',
        user_id: 'test-user',
        created_at: new Date().toISOString(),
        start_time: null,
        end_time: null,
        category: null,
        linked_task_id: null
      };

      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTimeBlock, error: null })
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });

      const result = await parseFunctionCall('addTimeBlock', {
        title: 'Test Time Block'
      });

      expect(result.success).toBe(true);
      expect(result.timeBlock).toEqual(mockTimeBlock);
      expect(supabase.from).toHaveBeenCalledWith('time_blocks');
    });
  });

  describe('unknown function', () => {
    it('should handle unknown function calls', async () => {
      const result = await parseFunctionCall('unknownFunction', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown function');
    });
  });
});
