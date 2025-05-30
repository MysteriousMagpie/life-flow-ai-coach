
import { GPTAction } from '../gptParser';
import { ActionResult, MealExecutor } from './MealExecutor';
import { WorkoutExecutor } from './WorkoutExecutor';
import { TimeBlockExecutor } from './TimeBlockExecutor';

export class AnalysisExecutor {
  private mealExecutor: MealExecutor;
  private workoutExecutor: WorkoutExecutor;
  private timeBlockExecutor: TimeBlockExecutor;

  constructor(
    mealExecutor: MealExecutor,
    workoutExecutor: WorkoutExecutor,
    timeBlockExecutor: TimeBlockExecutor
  ) {
    this.mealExecutor = mealExecutor;
    this.workoutExecutor = workoutExecutor;
    this.timeBlockExecutor = timeBlockExecutor;
  }

  async executeAction(action: GPTAction, dataWithUserId: any): Promise<ActionResult> {
    switch (action.functionName) {
      case 'generate_weekly_plan':
        return this.generateWeeklyPlan(dataWithUserId);
      case 'handle_missed_activity':
        return this.handleMissedActivity(dataWithUserId);
      case 'analyze_progress':
        return this.analyzeProgress(dataWithUserId);
      case 'generate_suggestions':
        return this.generateSuggestions(dataWithUserId);
      default:
        return {
          success: true,
          message: 'Analysis completed',
          data: dataWithUserId,
          functionName: action.functionName
        };
    }
  }

  private generateWeeklyPlan(data: any): ActionResult {
    console.log('[GENERATING WEEKLY PLAN]', data);
    
    const { goals = [], preferences = {} } = data;
    
    const planSummary = {
      meals: 0,
      workouts: 0,
      timeBlocks: 0,
      focus_areas: goals
    };

    if (goals.includes('improve_nutrition') || goals.includes('weight_loss')) {
      planSummary.meals = 21;
    }

    if (goals.includes('increase_fitness') || goals.includes('muscle_gain')) {
      planSummary.workouts = preferences.workout_days_per_week || 3;
    }

    if (goals.includes('increase_productivity') || goals.includes('better_time_management')) {
      planSummary.timeBlocks = 3;
    }

    return {
      success: true,
      message: `Comprehensive weekly plan generated targeting: ${goals.join(', ')}`,
      data: planSummary,
      functionName: 'generate_weekly_plan'
    };
  }

  private handleMissedActivity(data: any): ActionResult {
    console.log('[HANDLING MISSED ACTIVITY]', data);
    
    const { activity_type, activity_id, reason, reschedule_preference = 'next_available' } = data;
    
    return {
      success: true,
      message: `${activity_type} rescheduled for ${reschedule_preference.replace('_', ' ')}${reason ? `. Noted: ${reason}` : ''}`,
      data: { activity_type, new_schedule: reschedule_preference, reason },
      functionName: 'handle_missed_activity'
    };
  }

  private analyzeProgress(data: any): ActionResult {
    console.log('[MOCK] Analyzing progress:', data);
    
    return {
      success: true,
      message: `Progress analysis completed for ${data.focus_area || 'overall'} over the past ${data.timeframe || 'week'}.`,
      data: {
        insights: [
          'Task completion rate has improved by 15%',
          'Workout consistency is above average',
          'Meal planning adherence is strong',
          'Time blocking efficiency could be improved'
        ],
        metrics: data.metrics
      },
      functionName: 'analyze_progress'
    };
  }

  private generateSuggestions(data: any): ActionResult {
    console.log('[MOCK] Generating suggestions:', data);
    
    const suggestionsByCategory = {
      productivity: [
        'Use the Pomodoro Technique for focused work sessions',
        'Batch similar tasks together',
        'Set up a dedicated workspace'
      ],
      health: [
        'Add more vegetables to your meals',
        'Increase daily water intake',
        'Schedule regular movement breaks'
      ],
      schedule: [
        'Block time for important tasks',
        'Add buffer time between appointments',
        'Review and adjust priorities weekly'
      ],
      habits: [
        'Start with small, achievable goals',
        'Track your progress daily',
        'Create accountability systems'
      ],
      goals: [
        'Break large goals into smaller milestones',
        'Set specific deadlines',
        'Regular review and adjustment sessions'
      ]
    };

    const suggestions = suggestionsByCategory[data.category] || suggestionsByCategory.productivity;

    return {
      success: true,
      message: `Generated ${data.category} suggestions based on your current patterns.`,
      data: {
        suggestions,
        category: data.category,
        context: data.user_context
      },
      functionName: 'generate_suggestions'
    };
  }
}
