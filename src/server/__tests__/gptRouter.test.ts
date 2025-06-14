
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseFunctionCall } from '../gptRouter';
import { mealsService } from '../../services/mealsService';
import { workoutsService } from '../../services/workoutsService';
import { tasksService } from '../../services/tasksService';
import { remindersService } from '../../services/remindersService';
import { timeBlocksService } from '../../services/timeBlocksService';
import { supabase } from '../../integrations/supabase/client';

// Mock all services
vi.mock('../../services/mealsService');
vi.mock('../../services/workoutsService');
vi.mock('../../services/tasksService');
vi.mock('../../services/remindersService');
vi.mock('../../services/timeBlocksService');
vi.mock('../../integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('parseFunctionCall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
  });

  describe('createMeal', () => {
    it('should create a meal successfully', async () => {
      const mockMeal = {
        id: 'test-id',
        name: 'Test Meal',
        meal_type: 'breakfast',
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
        planned_date: null,
        calories: null,
        ingredients: null,
        instructions: null
      };

      vi.mocked(mealsService.create).mockResolvedValue(mockMeal);

      const result = await parseFunctionCall('createMeal', {
        name: 'Test Meal',
        meal_type: 'breakfast'
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMeal);
      expect(mealsService.create).toHaveBeenCalledWith({
        name: 'Test Meal',
        meal_type: 'breakfast',
        planned_date: undefined,
        calories: undefined,
        ingredients: undefined,
        instructions: undefined,
        user_id: 'test-user-id'
      });
    });

    it('should handle errors when creating a meal', async () => {
      const error = new Error('Database error');
      vi.mocked(mealsService.create).mockRejectedValue(error);

      const result = await parseFunctionCall('createMeal', {
        name: 'Test Meal'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('scheduleWorkout', () => {
    it('should schedule a workout successfully', async () => {
      const mockWorkout = {
        id: 'test-id',
        name: 'Test Workout',
        duration: 30,
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
        intensity: null,
        is_completed: false,
        shceduled_date: null
      };

      vi.mocked(workoutsService.create).mockResolvedValue(mockWorkout);

      const result = await parseFunctionCall('scheduleWorkout', {
        name: 'Test Workout',
        duration: 30
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWorkout);
    });
  });

  describe('addTask', () => {
    it('should add a task successfully', async () => {
      const mockTask = {
        id: 'test-id',
        title: 'Test Task',
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
        description: null,
        due_date: null,
        is_completed: false
      };

      vi.mocked(tasksService.create).mockResolvedValue(mockTask);

      const result = await parseFunctionCall('addTask', {
        title: 'Test Task'
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTask);
    });
  });

  describe('addReminder', () => {
    it('should add a reminder successfully', async () => {
      const mockReminder = {
        id: 'test-id',
        title: 'Test Reminder',
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
        due_date: null,
        is_completed: false
      };

      vi.mocked(remindersService.create).mockResolvedValue(mockReminder);

      const result = await parseFunctionCall('addReminder', {
        title: 'Test Reminder'
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReminder);
    });
  });

  describe('createTimeBlock', () => {
    it('should create a time block successfully', async () => {
      const mockTimeBlock = {
        id: 'test-id',
        title: 'Test Time Block',
        user_id: 'test-user-id',
        created_at: new Date().toISOString(),
        start_time: null,
        end_time: null,
        category: null,
        linked_task_id: null
      };

      vi.mocked(timeBlocksService.create).mockResolvedValue(mockTimeBlock);

      const result = await parseFunctionCall('createTimeBlock', {
        title: 'Test Time Block'
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTimeBlock);
    });
  });

  describe('unknown function', () => {
    it('should handle unknown function calls', async () => {
      const result = await parseFunctionCall('unknownFunction', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown function: unknownFunction');
    });
  });
});
