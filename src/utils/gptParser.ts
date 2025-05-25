
export interface ParsedResponse {
  message: string;
  actions: string[];
  activeModule: string | null;
  data: any;
}

class GPTParser {
  async processInput(input: string): Promise<ParsedResponse> {
    // Simulate GPT processing with keyword detection
    const lowerInput = input.toLowerCase();
    
    let message = "";
    let actions: string[] = [];
    let activeModule: string | null = null;
    let data: any = {};

    // Meal planning keywords
    if (lowerInput.includes('meal') || lowerInput.includes('eat') || lowerInput.includes('food') || lowerInput.includes('grocery')) {
      activeModule = 'meals';
      message = "I'll help you plan your meals! I'm creating a weekly meal plan and generating a grocery list.";
      actions = [
        "Generated 7-day meal plan",
        "Created grocery list",
        "Added to Apple Reminders",
        "Scheduled meal prep time"
      ];
      data.meals = this.generateMealPlan();
    }
    
    // Workout keywords
    else if (lowerInput.includes('gym') || lowerInput.includes('workout') || lowerInput.includes('exercise') || lowerInput.includes('fitness')) {
      activeModule = 'workouts';
      message = "Great! I'm setting up your workout routine and finding time slots in your schedule.";
      actions = [
        "Created workout schedule",
        "Blocked gym time in calendar",
        "Set workout reminders",
        "Suggested progressive routine"
      ];
      data.workouts = this.generateWorkoutPlan();
    }
    
    // Time/schedule keywords
    else if (lowerInput.includes('schedule') || lowerInput.includes('time') || lowerInput.includes('plan') || lowerInput.includes('calendar')) {
      activeModule = 'time-blocks';
      message = "I'm analyzing your goals and creating a realistic weekly schedule that balances all your priorities.";
      actions = [
        "Analyzed current commitments",
        "Created time blocks",
        "Scheduled focus time",
        "Added buffer periods"
      ];
      data.schedule = this.generateSchedule();
    }
    
    // Creative/productivity keywords
    else if (lowerInput.includes('creative') || lowerInput.includes('productive') || lowerInput.includes('work') || lowerInput.includes('project')) {
      activeModule = 'tasks';
      message = "I'll help you find time for creative work and boost your productivity with structured time blocks.";
      actions = [
        "Identified creative time slots",
        "Blocked focus periods",
        "Created project milestones",
        "Set productivity reminders"
      ];
      data.creativity = this.generateCreativeSchedule();
    }
    
    // Well-being keywords
    else if (lowerInput.includes('mood') || lowerInput.includes('journal') || lowerInput.includes('reflect') || lowerInput.includes('wellbeing') || lowerInput.includes('stress')) {
      activeModule = 'wellbeing';
      message = "I'm setting up your well-being tracking with daily check-ins and reflection prompts.";
      actions = [
        "Created mood tracking",
        "Scheduled reflection time",
        "Added mindfulness reminders",
        "Set up journaling prompts"
      ];
      data.wellbeing = this.generateWellbeingPlan();
    }
    
    // Generic/multiple areas
    else {
      activeModule = 'calendar';
      message = "I understand you want to improve multiple areas of your life. I'm creating a comprehensive plan that addresses your goals holistically.";
      actions = [
        "Analyzed your input",
        "Created integrated life plan",
        "Scheduled across modules",
        "Set up progress tracking"
      ];
      data.comprehensive = this.generateComprehensivePlan();
    }

    return { message, actions, activeModule, data };
  }

  private generateMealPlan() {
    return {
      week: [
        { day: 'Monday', breakfast: 'Overnight oats with berries', lunch: 'Quinoa salad', dinner: 'Grilled salmon with vegetables' },
        { day: 'Tuesday', breakfast: 'Greek yogurt parfait', lunch: 'Chicken wrap', dinner: 'Vegetarian stir-fry' },
        { day: 'Wednesday', breakfast: 'Smoothie bowl', lunch: 'Lentil soup', dinner: 'Baked chicken with sweet potato' },
      ],
      groceryList: ['Quinoa', 'Salmon', 'Greek yogurt', 'Berries', 'Chicken breast', 'Sweet potatoes', 'Mixed vegetables']
    };
  }

  private generateWorkoutPlan() {
    return {
      schedule: [
        { day: 'Monday', type: 'Strength Training', duration: '45 min', time: '7:00 AM' },
        { day: 'Wednesday', type: 'Cardio', duration: '30 min', time: '6:30 PM' },
        { day: 'Friday', type: 'Full Body', duration: '50 min', time: '7:00 AM' },
      ]
    };
  }

  private generateSchedule() {
    return {
      timeBlocks: [
        { time: '6:00-7:00', activity: 'Morning routine', type: 'personal' },
        { time: '7:00-8:00', activity: 'Workout', type: 'health' },
        { time: '9:00-12:00', activity: 'Deep work', type: 'productivity' },
        { time: '1:00-2:00', activity: 'Lunch & walk', type: 'break' },
        { time: '2:00-5:00', activity: 'Meetings & tasks', type: 'work' },
        { time: '6:00-7:00', activity: 'Creative time', type: 'personal' },
      ]
    };
  }

  private generateCreativeSchedule() {
    return {
      blocks: [
        { day: 'Monday', time: '6:00-7:00 PM', activity: 'Creative writing' },
        { day: 'Wednesday', time: '6:00-7:00 PM', activity: 'Art/Design work' },
        { day: 'Saturday', time: '9:00-11:00 AM', activity: 'Project development' },
      ]
    };
  }

  private generateWellbeingPlan() {
    return {
      daily: [
        { time: '8:00 AM', activity: 'Morning reflection (5 min)' },
        { time: '12:00 PM', activity: 'Mood check-in' },
        { time: '9:00 PM', activity: 'Evening gratitude journal' },
      ]
    };
  }

  private generateComprehensivePlan() {
    return {
      focus_areas: ['Health & Fitness', 'Productivity', 'Well-being', 'Creative Growth'],
      weekly_structure: 'Balanced approach with dedicated time for each area',
      next_steps: 'I\'ll coordinate across all modules to create your personalized plan'
    };
  }
}

export const gptParser = new GPTParser();
