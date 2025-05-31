
import { GPTAction } from '../gptParser';
import { useMeals } from '@/hooks/useMeals';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  functionName?: string;
}

export class MealExecutor {
  private mealsHook: ReturnType<typeof useMeals>;
  private timeBlocksHook: ReturnType<typeof useTimeBlocks>;

  constructor(mealsHook: ReturnType<typeof useMeals>, timeBlocksHook: ReturnType<typeof useTimeBlocks>) {
    this.mealsHook = mealsHook;
    this.timeBlocksHook = timeBlocksHook;
  }

  async executeAction(action: GPTAction, dataWithUserId: any): Promise<ActionResult> {
    switch (action.functionName) {
      case 'create_meal':
        this.mealsHook.createMeal(dataWithUserId);
        return {
          success: true,
          message: `Created meal: ${dataWithUserId.name}`,
          data: dataWithUserId,
          functionName: action.functionName
        };
      case 'create_meal_plan':
        return this.createMealPlan(dataWithUserId);
      case 'plan_meals_for_tomorrow':
      case 'plan_daily_meals':
        return this.planDailyMeals(dataWithUserId);
      case 'create_comprehensive_meal_plan':
        return this.createComprehensiveMealPlan(dataWithUserId);
      case 'list_meals':
        return {
          success: true,
          message: 'Retrieved meal list',
          data: { filter: dataWithUserId },
          functionName: action.functionName
        };
      default:
        switch (action.type) {
          case 'delete':
            if (action.id) {
              this.mealsHook.deleteMeal(action.id);
              return {
                success: true,
                message: 'Meal deleted successfully',
                functionName: action.functionName
              };
            }
            throw new Error('No meal ID provided for deletion');
          default:
            throw new Error(`Unsupported meal action: ${action.type}`);
        }
    }
  }

  private planDailyMeals(data: any): ActionResult {
    console.log('[PLANNING DAILY MEALS]', data);
    
    const { meals = [], target_date } = data;
    const planDate = target_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default to tomorrow
    
    // Define meal times
    const mealTimes = {
      breakfast: '08:00',
      morning_snack: '10:30',
      lunch: '12:30',
      afternoon_snack: '15:00',
      dinner: '18:30',
      evening_snack: '20:30'
    };

    let mealsCreated = 0;
    let timeBlocksCreated = 0;

    // Process each meal from the GPT response
    meals.forEach((meal: any) => {
      const mealType = meal.type || meal.meal_type || this.inferMealType(meal.name);
      const mealTime = mealTimes[mealType] || this.getDefaultTimeForMeal(mealType);
      
      // Create meal record
      const mealData = {
        user_id: data.user_id,
        name: meal.name || meal.title,
        meal_type: mealType,
        planned_date: planDate,
        calories: meal.calories || this.estimateCalories(meal.name),
        ingredients: meal.ingredients ? JSON.stringify(meal.ingredients) : null,
        instructions: meal.instructions || meal.notes || null
      };

      this.mealsHook.createMeal(mealData);
      mealsCreated++;

      // Create time block for the meal
      if (mealTime) {
        const [hours, minutes] = mealTime.split(':').map(Number);
        const startTime = new Date(planDate);
        startTime.setHours(hours, minutes, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + (mealType.includes('snack') ? 15 : 30)); // Snacks: 15min, Meals: 30min

        const timeBlockData = {
          user_id: data.user_id,
          title: `${this.capitalizeFirst(mealType)}: ${meal.name}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          category: 'meal'
        };

        this.timeBlocksHook.createTimeBlock(timeBlockData);
        timeBlocksCreated++;
      }
    });

    return {
      success: true,
      message: `Daily meal plan created: ${mealsCreated} meals and ${timeBlocksCreated} time blocks scheduled for ${planDate}`,
      data: { 
        mealsCreated,
        timeBlocksCreated,
        planDate,
        totalItems: mealsCreated + timeBlocksCreated
      },
      functionName: 'plan_daily_meals'
    };
  }

  private createMealPlan(data: any): ActionResult {
    console.log('[MOCK] Creating meal plan:', data);
    
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const sampleMeals = {
      breakfast: ['Oatmeal with berries', 'Scrambled eggs with toast', 'Greek yogurt with granola'],
      lunch: ['Grilled chicken salad', 'Quinoa bowl', 'Turkey sandwich'],
      dinner: ['Baked salmon with vegetables', 'Pasta with marinara', 'Stir-fry with tofu']
    };

    const startDate = new Date(data.start_date || new Date());
    for (let day = 0; day < (data.duration_days || 7); day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      mealTypes.forEach(mealType => {
        const meals = sampleMeals[mealType];
        const randomMeal = meals[Math.floor(Math.random() * meals.length)];
        
        this.mealsHook.createMeal({
          user_id: data.user_id,
          name: randomMeal,
          meal_type: mealType,
          planned_date: currentDate.toISOString().split('T')[0],
          calories: Math.floor(Math.random() * 300) + 200
        });
      });
    }

    return {
      success: true,
      message: `Created meal plan for ${data.duration_days || 7} days`,
      data: { duration: data.duration_days || 7, start_date: data.start_date },
      functionName: 'create_meal_plan'
    };
  }

  private createComprehensiveMealPlan(data: any): ActionResult {
    console.log('[CREATING COMPREHENSIVE MEAL PLAN]', data);
    
    const { duration_days = 7, target_calories_per_day = 2000, macro_goals, meal_prep_style = 'mixed' } = data;
    
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    if (target_calories_per_day > 2200) {
      mealTypes.push('snack');
    }

    const nutritionOptimizedMeals = {
      breakfast: [
        { name: 'Greek Yogurt with Berries and Granola', calories: 350, protein: 20 },
        { name: 'Avocado Toast with Eggs', calories: 400, protein: 18 },
        { name: 'Overnight Oats with Protein Powder', calories: 380, protein: 25 }
      ],
      lunch: [
        { name: 'Quinoa Power Bowl with Chicken', calories: 550, protein: 35 },
        { name: 'Mediterranean Salad with Salmon', calories: 480, protein: 32 },
        { name: 'Lentil and Vegetable Curry', calories: 420, protein: 18 }
      ],
      dinner: [
        { name: 'Baked Cod with Roasted Vegetables', calories: 450, protein: 40 },
        { name: 'Turkey and Sweet Potato Skillet', calories: 520, protein: 35 },
        { name: 'Chickpea and Spinach Stew', calories: 380, protein: 16 }
      ],
      snack: [
        { name: 'Apple with Almond Butter', calories: 200, protein: 8 },
        { name: 'Protein Smoothie', calories: 250, protein: 20 }
      ]
    };

    const startDate = new Date(data.start_date || new Date());
    let totalCreated = 0;

    for (let day = 0; day < duration_days; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      let dailyCalories = 0;
      const targetPerMeal = Math.floor(target_calories_per_day / mealTypes.length);

      mealTypes.forEach(mealType => {
        const mealOptions = nutritionOptimizedMeals[mealType];
        const selectedMeal = mealOptions[Math.floor(Math.random() * mealOptions.length)];
        
        this.mealsHook.createMeal({
          user_id: data.user_id,
          name: selectedMeal.name,
          meal_type: mealType,
          planned_date: currentDate.toISOString().split('T')[0],
          calories: selectedMeal.calories,
          ingredients: JSON.stringify([])
        });
        
        dailyCalories += selectedMeal.calories;
        totalCreated++;
      });
    }

    return {
      success: true,
      message: `Created comprehensive meal plan: ${totalCreated} meals over ${duration_days} days targeting ${target_calories_per_day} calories/day`,
      data: { 
        duration: duration_days, 
        totalMeals: totalCreated,
        targetCalories: target_calories_per_day,
        mealPrepStyle: meal_prep_style
      },
      functionName: 'create_comprehensive_meal_plan'
    };
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
    
    // Basic calorie estimation based on meal type and ingredients
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
