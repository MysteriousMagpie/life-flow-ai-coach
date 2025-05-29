
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseFunctionCall } from '../gptRouter';
import * as mealsService from '../../services/mealsService';
import * as workoutsService from '../../services/workoutsService';
import * as tasksService from '../../services/tasksService';
import * as remindersService from '../../services/remindersService';
import * as timeBlocksService from '../../services/timeBlocksService';

// Mock the services
vi.mock('../../services/mealsService');
vi.mock('../../services/workoutsService');
vi.mock('../../services/tasksService');
vi.mock('../../services/remindersService');
vi.mock('../../services/timeBlocksService');

describe('parseFunctionCall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMeal', () => {
    it('should create a meal successfully', async () => {
      const mockMeal = {
        id: '123',
        name: 'Chicken Salad',
        meal_type: 'lunch',
        user_id: 'temp-user'
      };

      vi.mocked(mealsService.mealsService.create).mockResolvedValue(mockMeal);

      const args = {
        name: 'Chicken Salad',
        meal_type: 'lunch',
        calories: 350,
        ingredients: ['chicken', 'lettuce', 'tomatoes']
      };

      const result = await parseFunctionCall('createMeal', args);

      expect(result).toEqual({
        success: true,
        data: mockMeal
      });

      expect(mealsService.mealsService.create).toHaveBeenCalledWith({
        name: 'Chicken Salad',
        meal_type: 'lunch',
        planned_date: undefined,
        calories: 350,
        ingredients: JSON.stringify(['chicken', 'lettuce', 'tomatoes']),
        instructions: undefined,
        user_id: 'temp-user'
      });
    });

    it('should handle createMeal errors', async () => {
      vi.mocked(mealsService.mealsService.create).mockRejectedValue(new Error('Database error'));

      const result = await parseFunctionCall('createMeal', { name: 'Test Meal' });

      expect(result).toEqual({
        success: false,
        error: 'Database error'
      });
    });
  });

  describe('scheduleWorkout', () => {
    it('should schedule a workout successfully', async () => {
      const mockWorkout = {
        id: '456',
        name: 'Morning Run',
        duration: 30,
        user_id: 'temp-user'
      };

      vi.mocked(workoutsService.workoutsService.create).mockResolvedValue(mockWorkout);

      const args = {
        name: 'Morning Run',
        duration: 30,
        intensity: 'medium'
      };

      const result = await parseFunctionCall('scheduleWorkout', args);

      expect(result).toEqual({
        success: true,
        data: mockWorkout
      });

      expect(workoutsService.workoutsService.create).toHaveBeenCalledWith({
        name: 'Morning Run',
        duration: 30,
        intensity: 'medium',
        shceduled_date: undefined,
        user_id: 'temp-user'
      });
    });
  });

  describe('addTask', () => {
    it('should add a task successfully', async () => {
      const mockTask = {
        id: '789',
        title: 'Buy groceries',
        user_id: 'temp-user'
      };

      vi.mocked(tasksService.tasksService.create).mockResolvedValue(mockTask);

      const args = {
        title: 'Buy groceries',
        description: 'Get items for dinner',
        due_date: '2024-01-15'
      };

      const result = await parseFunctionCall('addTask', args);

      expect(result).toEqual({
        success: true,
        data: mockTask
      });

      expect(tasksService.tasksService.create).toHaveBeenCalledWith({
        title: 'Buy groceries',
        description: 'Get items for dinner',
        due_date: '2024-01-15',
        user_id: 'temp-user'
      });
    });
  });

  describe('addReminder', () => {
    it('should add a reminder successfully', async () => {
      const mockReminder = {
        id: '101',
        title: 'Doctor appointment',
        user_id: 'temp-user'
      };

      vi.mocked(remindersService.remindersService.create).mockResolvedValue(mockReminder);

      const args = {
        title: 'Doctor appointment',
        due_date: '2024-01-20T10:00:00Z'
      };

      const result = await parseFunctionCall('addReminder', args);

      expect(result).toEqual({
        success: true,
        data: mockReminder
      });

      expect(remindersService.remindersService.create).toHaveBeenCalledWith({
        title: 'Doctor appointment',
        due_date: '2024-01-20T10:00:00Z',
        user_id: 'temp-user'
      });
    });
  });

  describe('createTimeBlock', () => {
    it('should create a time block successfully', async () => {
      const mockTimeBlock = {
        id: '202',
        title: 'Team meeting',
        user_id: 'temp-user'
      };

      vi.mocked(timeBlocksService.timeBlocksService.create).mockResolvedValue(mockTimeBlock);

      const args = {
        title: 'Team meeting',
        start_time: '09:00',
        end_time: '10:00',
        category: 'work'
      };

      const result = await parseFunctionCall('createTimeBlock', args);

      expect(result).toEqual({
        success: true,
        data: mockTimeBlock
      });

      expect(timeBlocksService.timeBlocksService.create).toHaveBeenCalledWith({
        title: 'Team meeting',
        start_time: '09:00',
        end_time: '10:00',
        category: 'work',
        linked_task_id: undefined,
        user_id: 'temp-user'
      });
    });
  });

  describe('unknown function', () => {
    it('should handle unknown functions', async () => {
      const result = await parseFunctionCall('unknownFunction', {});

      expect(result).toEqual({
        success: false,
        error: 'Unknown function: unknownFunction'
      });
    });
  });
});
