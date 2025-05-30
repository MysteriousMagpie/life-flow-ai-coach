
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
