
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase';

export interface GPTAction {
  type: 'addMeal' | 'addTask' | 'addWorkout' | 'addReminder' | 'addTimeBlock' | 'storeWorkoutPlan' | 'planDailyMeals';
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
        // Create meal and let the hook handle success/error states
        this.meals.createMeal(payloadWithUser);
        return { type: 'meal', data: payloadWithUser };
      
      case 'addTask':
        this.tasks.createTask(payloadWithUser);
        return { type: 'task', data: payloadWithUser };
      
      case 'addWorkout':
        this.workouts.createWorkout(payloadWithUser);
        return { type: 'workout', data: payloadWithUser };
      
      case 'addReminder':
        this.reminders.createReminder(payloadWithUser);
        return { type: 'reminder', data: payloadWithUser };
      
      case 'addTimeBlock':
        this.timeBlocks.createTimeBlock(payloadWithUser);
        return { type: 'timeBlock', data: payloadWithUser };
      
      case 'storeWorkoutPlan':
        return this.storeWorkoutPlan(action.payload, userId);
      
      case 'planDailyMeals':
        return this.planDailyMeals(action.payload, userId);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async planDailyMeals(mealPlan: any, userId: string): Promise<any> {
    console.log('Planning daily meals:', mealPlan);
    
    const { meals = [], target_date } = mealPlan;
    const planDate = target_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Define meal times for scheduling
    const mealTimes = {
      breakfast: '08:00',
      morning_snack: '10:30',
      lunch: '12:30',
      afternoon_snack: '15:00',
      dinner: '18:30',
      evening_snack: '20:30'
    };

    let itemsCreated = 0;

    // Process each meal from the GPT response
    for (const meal of meals) {
      try {
        const mealType = meal.type || meal.meal_type || this.inferMealType(meal.name);
        const mealTime = mealTimes[mealType] || this.getDefaultTimeForMeal(mealType);
        
        // Create meal record
        const mealData = {
          user_id: userId,
          name: meal.name || meal.title,
          meal_type: mealType,
          planned_date: planDate,
          calories: meal.calories || this.estimateCalories(meal.name),
          ingredients: meal.ingredients ? JSON.stringify(meal.ingredients) : null,
          instructions: meal.instructions || meal.notes || null
        };

        // Create meal through hook (will trigger proper state updates)
        this.meals.createMeal(mealData);
        itemsCreated++;

        // Create time block for the meal
        if (mealTime) {
          const [hours, minutes] = mealTime.split(':').map(Number);
          const startTime = new Date(planDate);
          startTime.setHours(hours, minutes, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + (mealType.includes('snack') ? 15 : 30));

          const timeBlockData = {
            user_id: userId,
            title: `${this.capitalizeFirst(mealType)}: ${meal.name}`,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            category: 'meal'
          };

          // Create time block through hook (will trigger proper state updates)
          this.timeBlocks.createTimeBlock(timeBlockData);
          itemsCreated++;
        }
      } catch (error) {
        console.error('Failed to create meal or time block:', error);
      }
    }

    return {
      success: true,
      message: `Daily meal plan initiated: ${Math.floor(itemsCreated/2)} meals scheduled for ${planDate}`,
      data: { 
        itemsCreated,
        planDate,
        mealsPlanned: Math.floor(itemsCreated/2)
      }
    };
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

  private inferMealType(mealName: string): string {
    const name = mealName.toLowerCase();
    
    if (name.includes('breakfast') || name.includes('cereal') || name.includes('oatmeal') || name.includes('eggs')) {
      return 'breakfast';
    } else if (name.includes('lunch') || name.includes('sandwich') || name.includes('salad')) {
      return 'lunch';
    } else if (name.includes('dinner') || name.includes('pasta') || name.includes('steak') || name.includes('chicken')) {
      return 'dinner';
    } else if (name.includes('snack') || name.includes('smoothie') || name.includes('fruit') || name.includes('nuts')) {
      return 'afternoon_snack';
    }
    
    return 'lunch'; // Default fallback
  }

  private getDefaultTimeForMeal(mealType: string): string {
    const defaultTimes = {
      breakfast: '08:00',
      morning_snack: '10:30',
      lunch: '12:30',
      afternoon_snack: '15:00',
      dinner: '18:30',
      evening_snack: '20:30'
    };
    
    return defaultTimes[mealType] || '12:00';
  }

  private estimateCalories(mealName: string): number {
    const name = mealName.toLowerCase();
    
    if (name.includes('salad')) return 350;
    if (name.includes('smoothie')) return 280;
    if (name.includes('pasta')) return 550;
    if (name.includes('sandwich')) return 420;
    if (name.includes('soup')) return 250;
    if (name.includes('steak') || name.includes('salmon')) return 600;
    if (name.includes('chicken')) return 450;
    if (name.includes('snack') || name.includes('fruit')) return 150;
    
    return 400; // Default estimate
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ');
  }
}
