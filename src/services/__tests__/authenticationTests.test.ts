
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase';
import { mealsService } from '@/services/mealsService';
import { tasksService } from '@/services/tasksService';
import { workoutsService } from '@/services/workoutsService';
import { remindersService } from '@/services/remindersService';
import { timeBlocksService } from '@/services/timeBlocksService';

// Mock the Supabase client
vi.mock('@/integrations/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('Authentication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated requests should return errors', () => {
    beforeEach(() => {
      // Mock unauthenticated user
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      });
    });

    it('should throw error when getting all meals without authentication', async () => {
      await expect(mealsService.getAll()).rejects.toThrow('User not authenticated');
    });

    it('should throw error when getting all tasks without authentication', async () => {
      await expect(tasksService.getAll()).rejects.toThrow('User not authenticated');
    });

    it('should throw error when getting all workouts without authentication', async () => {
      await expect(workoutsService.getAll()).rejects.toThrow('User not authenticated');
    });

    it('should throw error when getting all reminders without authentication', async () => {
      await expect(remindersService.getAll()).rejects.toThrow('User not authenticated');
    });

    it('should throw error when getting all time blocks without authentication', async () => {
      await expect(timeBlocksService.getAll()).rejects.toThrow('User not authenticated');
    });

    it('should throw error when creating meal without authentication', async () => {
      const mealData = {
        user_id: 'test-user-id',
        name: 'Test Meal',
        meal_type: 'breakfast',
        planned_date: '2024-01-01'
      };
      await expect(mealsService.create(mealData)).rejects.toThrow('User not authenticated');
    });

    it('should throw error when creating task without authentication', async () => {
      const taskData = {
        user_id: 'test-user-id',
        title: 'Test Task',
        description: 'Test Description'
      };
      await expect(tasksService.create(taskData)).rejects.toThrow('User not authenticated');
    });

    it('should throw error when creating workout without authentication', async () => {
      const workoutData = {
        user_id: 'test-user-id',
        name: 'Test Workout',
        scheduled_date: '2024-01-01'
      };
      await expect(workoutsService.create(workoutData)).rejects.toThrow('User not authenticated');
    });

    it('should throw error when creating reminder without authentication', async () => {
      const reminderData = {
        user_id: 'test-user-id',
        title: 'Test Reminder',
        due_date: '2024-01-01T12:00:00Z'
      };
      await expect(remindersService.create(reminderData)).rejects.toThrow('User not authenticated');
    });

    it('should throw error when creating time block without authentication', async () => {
      const timeBlockData = {
        user_id: 'test-user-id',
        title: 'Test Time Block',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T11:00:00Z'
      };
      await expect(timeBlocksService.create(timeBlockData)).rejects.toThrow('User not authenticated');
    });
  });

  describe('Authenticated requests should work', () => {
    const mockUser = { 
      id: 'test-user-id',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
      email: 'test@example.com'
    };

    beforeEach(() => {
      // Mock authenticated user
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
    });

    it('should not throw authentication error for authenticated meal requests', async () => {
      // Mock the actual Supabase query methods since we're only testing auth
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      };
      vi.mocked(supabase).from = vi.fn().mockReturnValue(mockFrom);

      await expect(mealsService.getAll()).resolves.not.toThrow();
    });
  });
});
