import { GPTAction } from '../gptParser';
import { useWorkouts } from '@/hooks/useWorkouts';
import { ActionResult } from './MealExecutor';

export class WorkoutExecutor {
  private workoutsHook: ReturnType<typeof useWorkouts>;

  constructor(workoutsHook: ReturnType<typeof useWorkouts>) {
    this.workoutsHook = workoutsHook;
  }

  async executeAction(action: GPTAction, dataWithUserId: any): Promise<ActionResult> {
    switch (action.functionName) {
      case 'create_workout':
        if (dataWithUserId.scheduled_date) {
          dataWithUserId.shceduled_date = dataWithUserId.scheduled_date;
          delete dataWithUserId.scheduled_date;
        }
        if (dataWithUserId.workout_type) {
          delete dataWithUserId.workout_type;
        }
        if (dataWithUserId.exercises) {
          delete dataWithUserId.exercises;
        }
        this.workoutsHook.createWorkout(dataWithUserId);
        return {
          success: true,
          message: `Created workout: ${dataWithUserId.name}`,
          data: dataWithUserId,
          functionName: action.functionName
        };
      case 'store_workout_plan':
      case 'create_12_week_plan':
        return this.storeWorkoutPlan(dataWithUserId);
      case 'create_workout_plan':
        return this.createWorkoutPlan(dataWithUserId);
      case 'create_fitness_program':
        return this.createFitnessProgram(dataWithUserId);
      case 'complete_workout':
        if (action.id) {
          this.workoutsHook.completeWorkout(action.id);
          return {
            success: true,
            message: 'Workout marked as complete',
            functionName: action.functionName
          };
        }
        throw new Error('No workout ID provided for completion');
      default:
        switch (action.type) {
          case 'delete':
            if (action.id) {
              this.workoutsHook.deleteWorkout(action.id);
              return {
                success: true,
                message: 'Workout deleted successfully',
                functionName: action.functionName
              };
            }
            throw new Error('No workout ID provided for deletion');
          default:
            throw new Error(`Unsupported workout action: ${action.type}`);
        }
    }
  }

  private async storeWorkoutPlan(data: any): Promise<ActionResult> {
    console.log('[STORING WORKOUT PLAN]', data);
    
    const plan = data.plan || data.workoutPlan || data;
    const workouts = this.parseWorkoutPlan(plan, data.user_id);
    
    let createdCount = 0;
    for (const workout of workouts) {
      try {
        this.workoutsHook.createWorkout(workout);
        createdCount++;
      } catch (error) {
        console.error('Failed to create workout:', error);
      }
    }

    return {
      success: true,
      message: `Successfully stored ${createdCount} workouts from 12-week plan`,
      data: { totalWorkouts: createdCount, planDuration: '12 weeks' },
      functionName: 'store_workout_plan'
    };
  }

  private parseWorkoutPlan(plan: any, userId: string): any[] {
    const workouts = [];
    const startDate = new Date();
    
    // Handle different plan formats
    if (typeof plan === 'string') {
      // Parse text-based plan
      return this.parseTextWorkoutPlan(plan, userId, startDate);
    }
    
    if (Array.isArray(plan)) {
      // Array of weeks
      plan.forEach((week, weekIndex) => {
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
    } else if (typeof plan === 'object') {
      // Structured object with phases
      for (let week = 1; week <= 12; week++) {
        const phase = this.getPhase(week);
        const sessions = this.generateWeekSessions(week, phase);
        
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
      }
    }
    
    return workouts;
  }

  private getPhase(week: number): string {
    if (week <= 4) return 'Foundation';
    if (week <= 8) return 'Development';
    return 'Peak';
  }

  private generateWeekSessions(weekNumber: number, phase: string): any[] {
    const sessions = [];
    
    // Strength training session
    sessions.push({
      name: `${phase} Phase - Strength Training (Week ${weekNumber})`,
      duration: weekNumber <= 4 ? 45 : weekNumber <= 8 ? 60 : 75,
      intensity: weekNumber <= 4 ? 'medium' : 'high',
      category: 'strength'
    });
    
    // Cardio session
    sessions.push({
      name: `${phase} Phase - Cardio Session (Week ${weekNumber})`,
      duration: weekNumber <= 4 ? 30 : weekNumber <= 8 ? 40 : 45,
      intensity: weekNumber <= 4 ? 'medium' : weekNumber <= 8 ? 'medium' : 'high',
      category: 'cardio'
    });
    
    // Additional session for development and peak phases
    if (weekNumber > 4) {
      sessions.push({
        name: `${phase} Phase - Functional Training (Week ${weekNumber})`,
        duration: 45,
        intensity: 'medium',
        category: 'functional'
      });
    }
    
    return sessions;
  }

  private parseTextWorkoutPlan(planText: string, userId: string, startDate: Date): any[] {
    const workouts = [];
    
    for (let week = 1; week <= 12; week++) {
      const phase = this.getPhase(week);
      const sessions = this.generateWeekSessions(week, phase);
      
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
    }
    
    return workouts;
  }

  private createWorkoutPlan(data: any): ActionResult {
    console.log('[MOCK] Creating workout plan:', data);
    
    const workoutTypes = ['cardio', 'strength', 'flexibility'];
    const sampleWorkouts = {
      cardio: ['Running', 'Cycling', 'Swimming', 'HIIT'],
      strength: ['Weight lifting', 'Bodyweight exercises', 'Resistance training'],
      flexibility: ['Yoga', 'Stretching', 'Pilates']
    };

    const sessionsPerWeek = data.sessions_per_week || 3;
    const weeks = data.duration_weeks || 4;
    
    for (let week = 0; week < weeks; week++) {
      for (let session = 0; session < sessionsPerWeek; session++) {
        const workoutType = data.preferred_workout_types?.[session % data.preferred_workout_types.length] || 
                           workoutTypes[session % workoutTypes.length];
        const workouts = sampleWorkouts[workoutType] || sampleWorkouts.cardio;
        const randomWorkout = workouts[Math.floor(Math.random() * workouts.length)];
        
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() + (week * 7) + (session * 2));
        
        this.workoutsHook.createWorkout({
          user_id: data.user_id,
          name: randomWorkout,
          duration: Math.floor(Math.random() * 60) + 30,
          intensity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          shceduled_date: sessionDate.toISOString().split('T')[0]
        });
      }
    }

    return {
      success: true,
      message: `Created ${weeks}-week workout plan with ${sessionsPerWeek} sessions per week`,
      data: { weeks, sessionsPerWeek },
      functionName: 'create_workout_plan'
    };
  }

  private createFitnessProgram(data: any): ActionResult {
    console.log('[CREATING FITNESS PROGRAM]', data);
    
    const { fitness_goals, available_days = 3, session_duration = 45, experience_level = 'beginner' } = data;
    
    const workoutPrograms = {
      beginner: {
        weight_loss: ['Full Body Circuit', 'Walking/Light Cardio', 'Basic Strength Training'],
        muscle_gain: ['Upper Body Strength', 'Lower Body Strength', 'Full Body Compound'],
        endurance: ['Cardio Intervals', 'Steady State Cardio', 'Active Recovery Walk']
      },
      intermediate: {
        weight_loss: ['HIIT Training', 'Strength + Cardio', 'Metabolic Circuits'],
        muscle_gain: ['Push Day', 'Pull Day', 'Leg Day', 'Core Focus'],
        endurance: ['Long Cardio Sessions', 'Tempo Runs', 'Cross Training']
      },
      advanced: {
        weight_loss: ['Complex HIIT', 'Strength Supersets', 'Metabolic Finishers'],
        muscle_gain: ['Heavy Compound Lifts', 'Isolation Focus', 'Power Training'],
        endurance: ['Endurance Challenges', 'Sport-Specific Training', 'Recovery Sessions']
      }
    };

    const primaryGoal = fitness_goals[0] || 'muscle_gain';
    const workouts = workoutPrograms[experience_level][primaryGoal] || workoutPrograms.beginner.muscle_gain;
    
    let workoutsCreated = 0;
    const weeks = 4;

    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < available_days; day++) {
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() + (week * 7) + (day * 2));
        
        const workoutIndex = day % workouts.length;
        const workoutName = workouts[workoutIndex];
        
        this.workoutsHook.createWorkout({
          user_id: data.user_id,
          name: `${workoutName} - Week ${week + 1}`,
          duration: session_duration,
          intensity: experience_level === 'beginner' ? 'medium' : 'high',
          shceduled_date: sessionDate.toISOString().split('T')[0]
        });
        
        workoutsCreated++;
      }
    }

    return {
      success: true,
      message: `Created ${weeks}-week fitness program: ${workoutsCreated} workouts for ${primaryGoal} (${experience_level} level)`,
      data: { 
        weeks, 
        totalWorkouts: workoutsCreated, 
        sessionsPerWeek: available_days,
        primaryGoal,
        experienceLevel: experience_level
      },
      functionName: 'create_fitness_program'
    };
  }
}
