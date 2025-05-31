
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface GPTAction {
  type: 'addMeal' | 'addTask' | 'addWorkout' | 'addReminder' | 'addTimeBlock' | 'storeWorkoutPlan';
  payload: any;
}

export class ActionExecutor {
  private toast: any;
  private meals: any;
  private tasks: any;
  private workouts: any;
  private reminders: any;
  private timeBlocks: any;

  constructor(hooks: {
    meals: any;
    tasks: any;
    workouts: any;
    reminders: any;
    timeBlocks: any;
  }) {
    this.meals = hooks.meals;
    this.tasks = hooks.tasks;
    this.workouts = hooks.workouts;
    this.reminders = hooks.reminders;
    this.timeBlocks = hooks.timeBlocks;
  }

  async executeActions(actions: GPTAction[], userId: string): Promise<any[]> {
    const results = [];
    
    for (const action of actions) {
      try {
        const result = await this.executeAction(action, userId);
        results.push({ action: action.type, success: true, result });
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
        results.push({ action: action.type, success: false, error: error.message });
      }
    }
    
    return results;
  }

  private async executeAction(action: GPTAction, userId: string): Promise<any> {
    // Add user_id to payload for all actions
    const payloadWithUser = { ...action.payload, user_id: userId };

    switch (action.type) {
      case 'addMeal':
        return this.meals.createMeal(payloadWithUser);
      
      case 'addTask':
        return this.tasks.createTask(payloadWithUser);
      
      case 'addWorkout':
        return this.workouts.createWorkout(payloadWithUser);
      
      case 'addReminder':
        return this.reminders.createReminder(payloadWithUser);
      
      case 'addTimeBlock':
        return this.timeBlocks.createTimeBlock(payloadWithUser);
      
      case 'storeWorkoutPlan':
        return this.storeWorkoutPlan(action.payload, userId);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async storeWorkoutPlan(workoutPlan: any, userId: string): Promise<any> {
    console.log('Storing 12-week workout plan:', workoutPlan);
    
    const workouts = this.parseWorkoutPlan(workoutPlan, userId);
    let createdCount = 0;

    for (const workout of workouts) {
      try {
        await this.workouts.createWorkout(workout);
        createdCount++;
      } catch (error) {
        console.error('Failed to create workout:', error);
      }
    }

    return {
      success: true,
      message: `Successfully stored ${createdCount} workouts from 12-week plan`,
      totalWorkouts: createdCount,
      data: { planDuration: '12 weeks', workoutsCreated: createdCount }
    };
  }

  private parseWorkoutPlan(plan: any, userId: string): any[] {
    const workouts = [];
    const startDate = new Date();
    
    // Handle different plan formats
    const planData = plan.weeks || plan.plan || plan;
    
    if (Array.isArray(planData)) {
      // Format: array of weeks
      planData.forEach((week, weekIndex) => {
        const weekNumber = weekIndex + 1;
        const phase = this.getPhase(weekNumber);
        
        if (week.workouts && Array.isArray(week.workouts)) {
          week.workouts.forEach((workout, dayIndex) => {
            const scheduledDate = new Date(startDate);
            scheduledDate.setDate(startDate.getDate() + (weekIndex * 7) + dayIndex);
            
            workouts.push({
              user_id: userId,
              name: workout.name || `Week ${weekNumber} - ${workout.type || 'Workout'}`,
              duration: workout.duration || 45,
              intensity: workout.intensity || 'medium',
              shceduled_date: scheduledDate.toISOString().split('T')[0],
              is_completed: false
            });
          });
        }
      });
    } else if (typeof planData === 'object') {
      // Format: structured object with phases
      for (let week = 1; week <= 12; week++) {
        const phase = this.getPhase(week);
        const weekKey = `week${week}` || `Week ${week}`;
        const weekData = planData[weekKey] || planData[`week_${week}`];
        
        if (weekData) {
          // Parse strength and cardio sessions
          const sessions = this.parseWeekSessions(weekData, week);
          sessions.forEach((session, dayIndex) => {
            const scheduledDate = new Date(startDate);
            scheduledDate.setDate(startDate.getDate() + ((week - 1) * 7) + (dayIndex * 2));
            
            workouts.push({
              user_id: userId,
              name: session.name,
              duration: session.duration,
              intensity: session.intensity,
              shceduled_date: scheduledDate.toISOString().split('T')[0],
              is_completed: false
            });
          });
        } else {
          // Generate default workouts for this week
          const defaultSessions = this.generateDefaultWeekWorkouts(week, phase);
          defaultSessions.forEach((session, dayIndex) => {
            const scheduledDate = new Date(startDate);
            scheduledDate.setDate(startDate.getDate() + ((week - 1) * 7) + (dayIndex * 2));
            
            workouts.push({
              user_id: userId,
              name: session.name,
              duration: session.duration,
              intensity: session.intensity,
              shceduled_date: scheduledDate.toISOString().split('T')[0],
              is_completed: false
            });
          });
        }
      }
    } else if (typeof plan === 'string') {
      // Handle text-based workout plans
      workouts.push(...this.parseTextWorkoutPlan(plan, userId, startDate));
    }

    return workouts;
  }

  private getPhase(week: number): string {
    if (week <= 4) return 'Foundation (Weeks 1-4)';
    if (week <= 8) return 'Development (Weeks 5-8)';
    return 'Peak (Weeks 9-12)';
  }

  private parseWeekSessions(weekData: any, weekNumber: number): any[] {
    const sessions = [];
    const phase = this.getPhase(weekNumber);
    
    // Look for strength training sessions
    if (weekData.strength || weekData.strengthTraining) {
      const strengthData = weekData.strength || weekData.strengthTraining;
      sessions.push({
        name: `${phase} - Strength Training`,
        duration: strengthData.duration || 60,
        intensity: strengthData.intensity || 'high',
        category: 'strength'
      });
    }
    
    // Look for cardio sessions
    if (weekData.cardio || weekData.cardiovascular) {
      const cardioData = weekData.cardio || weekData.cardiovascular;
      sessions.push({
        name: `${phase} - Cardio Session`,
        duration: cardioData.duration || 30,
        intensity: cardioData.intensity || 'medium',
        category: 'cardio'
      });
    }
    
    // Look for other session types
    if (weekData.sessions && Array.isArray(weekData.sessions)) {
      weekData.sessions.forEach(session => {
        sessions.push({
          name: session.name || `Week ${weekNumber} - ${session.type || 'Workout'}`,
          duration: session.duration || 45,
          intensity: session.intensity || 'medium',
          category: session.type || 'general'
        });
      });
    }
    
    // If no specific sessions found, generate defaults
    if (sessions.length === 0) {
      sessions.push(...this.generateDefaultWeekWorkouts(weekNumber, phase));
    }
    
    return sessions;
  }

  private generateDefaultWeekWorkouts(weekNumber: number, phase: string): any[] {
    const sessions = [];
    
    // Strength training session
    sessions.push({
      name: `${phase} - Strength Training`,
      duration: weekNumber <= 4 ? 45 : weekNumber <= 8 ? 60 : 75,
      intensity: weekNumber <= 4 ? 'medium' : 'high',
      category: 'strength'
    });
    
    // Cardio session
    sessions.push({
      name: `${phase} - Cardio Workout`,
      duration: weekNumber <= 4 ? 30 : weekNumber <= 8 ? 40 : 45,
      intensity: weekNumber <= 4 ? 'medium' : weekNumber <= 8 ? 'medium' : 'high',
      category: 'cardio'
    });
    
    // Additional session for later phases
    if (weekNumber > 4) {
      sessions.push({
        name: `${phase} - Functional Training`,
        duration: 45,
        intensity: 'medium',
        category: 'functional'
      });
    }
    
    return sessions;
  }

  private parseTextWorkoutPlan(planText: string, userId: string, startDate: Date): any[] {
    const workouts = [];
    const lines = planText.split('\n').filter(line => line.trim());
    
    let currentWeek = 1;
    for (let week = 1; week <= 12; week++) {
      const phase = this.getPhase(week);
      
      // Generate 3 workouts per week
      for (let day = 0; day < 3; day++) {
        const scheduledDate = new Date(startDate);
        scheduledDate.setDate(startDate.getDate() + ((week - 1) * 7) + (day * 2));
        
        const workoutTypes = ['Strength Training', 'Cardio Session', 'Functional Training'];
        const intensities = week <= 4 ? 'medium' : week <= 8 ? 'medium' : 'high';
        const durations = week <= 4 ? [45, 30, 40] : week <= 8 ? [60, 40, 45] : [75, 45, 50];
        
        workouts.push({
          user_id: userId,
          name: `${phase} - ${workoutTypes[day]}`,
          duration: durations[day],
          intensity: intensities,
          shceduled_date: scheduledDate.toISOString().split('T')[0],
          is_completed: false
        });
      }
    }
    
    return workouts;
  }
}
