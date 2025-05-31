
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Dumbbell, Bell, Utensils, Calendar, Clock } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

export const QuickActionPanel = () => {
  // Mock data for now - in a real app this would come from hooks
  const pendingTasks = [];
  const overdueTasks = [];
  const workouts = [];
  const reminders = [];
  const meals = [];

  const todayWorkouts = workouts.filter(w => 
    w.scheduled_date && isToday(new Date(w.scheduled_date)) && !w.is_completed
  );

  const upcomingReminders = reminders.filter(r => {
    if (!r.due_date) return false;
    const dueDate = new Date(r.due_date);
    return (isToday(dueDate) || isTomorrow(dueDate)) && !r.is_completed;
  });

  const todayMeals = meals.filter(m => 
    m.planned_date && isToday(new Date(m.planned_date))
  );

  const quickStats = [
    {
      icon: CheckCircle,
      label: 'Pending Tasks',
      count: pendingTasks.length,
      urgent: overdueTasks.length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Dumbbell,
      label: 'Today\'s Workouts',
      count: todayWorkouts.length,
      urgent: 0,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Bell,
      label: 'Upcoming Reminders',
      count: upcomingReminders.length,
      urgent: 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Utensils,
      label: 'Today\'s Meals',
      count: todayMeals.length,
      urgent: 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="font-semibold text-gray-800 mb-4">Quick Overview</h3>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className={`p-3 ${stat.bgColor} border-0`}>
            <div className="flex items-center gap-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div className="flex-1">
                <p className="text-xs text-gray-600">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{stat.count}</span>
                  {stat.urgent > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {stat.urgent} urgent
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Priority Items */}
      <div className="space-y-3">
        {overdueTasks.length > 0 && (
          <Card className="p-3 bg-red-50 border-red-200">
            <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Overdue Tasks
            </h4>
            <div className="space-y-1">
              {overdueTasks.slice(0, 3).map(task => (
                <p key={task.id} className="text-sm text-red-700">
                  • {task.title}
                </p>
              ))}
              {overdueTasks.length > 3 && (
                <p className="text-xs text-red-600">
                  +{overdueTasks.length - 3} more overdue tasks
                </p>
              )}
            </div>
          </Card>
        )}

        {todayWorkouts.length > 0 && (
          <Card className="p-3 bg-green-50 border-green-200">
            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Today's Workouts
            </h4>
            <div className="space-y-1">
              {todayWorkouts.slice(0, 2).map(workout => (
                <p key={workout.id} className="text-sm text-green-700">
                  • {workout.name} ({workout.intensity})
                </p>
              ))}
            </div>
          </Card>
        )}

        {upcomingReminders.length > 0 && (
          <Card className="p-3 bg-orange-50 border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Upcoming Reminders
            </h4>
            <div className="space-y-1">
              {upcomingReminders.slice(0, 2).map(reminder => (
                <div key={reminder.id} className="text-sm text-orange-700">
                  <p>• {reminder.title}</p>
                  {reminder.due_date && (
                    <p className="text-xs text-orange-600 ml-2">
                      {format(new Date(reminder.due_date), 'MMM d, h:mm a')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
};
