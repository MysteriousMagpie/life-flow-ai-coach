
export interface PlanningIntent {
  isPlanning: boolean;
  goals: string[];
  timeframe: 'day' | 'week' | 'month';
  preferences: any;
}

export class IntentDetector {
  detectPlanningIntent(input: string): PlanningIntent {
    const planningKeywords = [
      'help me', 'plan', 'schedule', 'organize', 'improve', 'better',
      'weekly plan', 'meal plan', 'workout plan', 'time management'
    ];
    
    const hasKeywords = planningKeywords.some(keyword => 
      input.toLowerCase().includes(keyword)
    );

    if (!hasKeywords) {
      return { isPlanning: false, goals: [], timeframe: 'week', preferences: {} };
    }

    // Extract goals
    const goals = this.extractGoals(input);
    
    // Determine timeframe
    const timeframe = this.extractTimeframe(input);
    
    // Extract preferences
    const preferences = this.extractPreferences(input);

    return {
      isPlanning: true,
      goals,
      timeframe,
      preferences
    };
  }

  private extractGoals(input: string): string[] {
    const goals: string[] = [];
    
    // Health and fitness goals
    if (/eat\s+(better|healthier|clean)/i.test(input)) {
      goals.push('improve_nutrition');
    }
    if (/gym|workout|exercise|fitness/i.test(input)) {
      goals.push('increase_fitness');
    }
    if (/lose\s+weight/i.test(input)) {
      goals.push('weight_loss');
    }
    if (/gain\s+(muscle|weight)/i.test(input)) {
      goals.push('muscle_gain');
    }
    
    // Productivity goals
    if (/productive|focus|organized/i.test(input)) {
      goals.push('increase_productivity');
    }
    if (/time\s+management/i.test(input)) {
      goals.push('better_time_management');
    }
    
    // General wellness
    if (/balance|stress|relax/i.test(input)) {
      goals.push('work_life_balance');
    }
    
    return goals.length > 0 ? goals : ['general_improvement'];
  }

  private extractTimeframe(input: string): 'day' | 'week' | 'month' {
    if (/today|tomorrow/i.test(input)) return 'day';
    if (/month|monthly/i.test(input)) return 'month';
    return 'week'; // default
  }

  private extractPreferences(input: string): any {
    const preferences: any = {};
    
    // Workout frequency
    const workoutMatch = input.match(/(\d+)\s*(?:times?|days?)\s*(?:a\s+)?week/i);
    if (workoutMatch) {
      preferences.workoutDaysPerWeek = parseInt(workoutMatch[1]);
    }
    
    // Diet preferences
    if (/vegetarian/i.test(input)) preferences.diet = 'vegetarian';
    if (/vegan/i.test(input)) preferences.diet = 'vegan';
    if (/keto/i.test(input)) preferences.diet = 'keto';
    if (/low\s*carb/i.test(input)) preferences.diet = 'low_carb';
    
    // Time constraints
    const timeMatch = input.match(/(\d+)\s*hours?\s*(?:a\s+)?day/i);
    if (timeMatch) {
      preferences.availableHoursPerDay = parseInt(timeMatch[1]);
    }
    
    return preferences;
  }
}

export const intentDetector = new IntentDetector();
