
import { GPTAction } from '../gptParser';

export class ModuleDetector {
  determineActiveModule(actions: GPTAction[]): string | null {
    if (actions.length === 0) return null;
    
    // Find the most relevant module from actions
    const moduleCount = actions.reduce((acc, action) => {
      // Map analysis module to appropriate UI module
      const uiModule = action.module === 'analysis' ? null : action.module;
      if (uiModule) {
        acc[uiModule] = (acc[uiModule] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Special handling for comprehensive planning
    const hasComprehensivePlan = actions.some(a => 
      a.functionName?.includes('comprehensive') || 
      a.functionName?.includes('weekly_plan') ||
      a.functionName?.includes('smart_schedule')
    );
    
    if (hasComprehensivePlan) return 'timeline';

    // Special handling for meal plans and workout plans
    const hasMealPlan = actions.some(a => a.functionName === 'create_meal_plan');
    const hasWorkoutPlan = actions.some(a => a.functionName === 'create_workout_plan');
    const hasScheduleOptimization = actions.some(a => a.functionName === 'optimize_schedule');

    if (hasMealPlan) return 'meals';
    if (hasWorkoutPlan) return 'workouts';
    if (hasScheduleOptimization) return 'timeline';

    return Object.entries(moduleCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
  }
}

export const moduleDetector = new ModuleDetector();
