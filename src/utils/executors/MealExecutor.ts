
import { GPTAction } from '../gptParser';
import { useMeals } from '@/hooks/useMeals';

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  functionName?: string;
}

export class MealExecutor {
  private mealsHook: ReturnType<typeof useMeals>;

  constructor(mealsHook: ReturnType<typeof useMeals>) {
    this.mealsHook = mealsHook;
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
}
