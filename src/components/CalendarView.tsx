
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useTasks } from '@/hooks/useTasks';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useReminders } from '@/hooks/useReminders';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { useMeals } from '@/hooks/useMeals';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Dumbbell,
  CheckSquare,
  Bell,
  Utensils,
  Download
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const { toast } = useToast();
  
  const { tasks } = useTasks();
  const { workouts } = useWorkouts();
  const { reminders } = useReminders();
  const { timeBlocks } = useTimeBlocks();
  const { meals } = useMeals();

  const getItemsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayTasks = tasks.filter(task => 
      task.due_date && format(new Date(task.due_date), 'yyyy-MM-dd') === dateStr
    );
    
    const dayWorkouts = workouts.filter(workout => 
      workout.shceduled_date && format(new Date(workout.shceduled_date), 'yyyy-MM-dd') === dateStr
    );
    
    const dayReminders = reminders.filter(reminder => 
      reminder.due_date && format(new Date(reminder.due_date), 'yyyy-MM-dd') === dateStr
    );
    
    const dayTimeBlocks = timeBlocks.filter(block => 
      block.start_time && format(new Date(block.start_time), 'yyyy-MM-dd') === dateStr
    );
    
    const dayMeals = meals.filter(meal => 
      meal.planned_date && meal.planned_date === dateStr
    );
    
    return { dayTasks, dayWorkouts, dayReminders, dayTimeBlocks, dayMeals };
  };

  const handleDownloadCalendar = async () => {
    try {
      // Use temp-user since we're not using real authentication yet
      const response = await fetch('/api/ical/temp-user');
      
      if (!response.ok) {
        throw new Error('Failed to generate calendar export');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'life-flow.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Calendar exported successfully",
      });
    } catch (error) {
      console.error('Calendar export error:', error);
      toast({
        title: "Error",
        description: "Failed to export calendar",
        variant: "destructive",
      });
    }
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <div className="grid grid-cols-7 gap-2 h-96">
        {weekDays.map((day) => {
          const { dayTasks, dayWorkouts, dayReminders, dayTimeBlocks, dayMeals } = getItemsForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isToday(day);
          
          return (
            <Card 
              key={day.toISOString()} 
              className={`p-2 cursor-pointer transition-colors ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              } ${isDayToday ? 'bg-blue-50' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <div className={`text-sm font-medium mb-2 ${isDayToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {format(day, 'EEE d')}
              </div>
              
              <div className="space-y-1 text-xs">
                {dayTimeBlocks.map((block) => (
                  <div key={block.id} className="flex items-center gap-1 text-purple-600">
                    <Clock className="h-3 w-3" />
                    <span className="truncate">{block.title}</span>
                  </div>
                ))}
                
                {dayTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-1 text-orange-600">
                    <CheckSquare className="h-3 w-3" />
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
                
                {dayWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center gap-1 text-green-600">
                    <Dumbbell className="h-3 w-3" />
                    <span className="truncate">{workout.name}</span>
                  </div>
                ))}
                
                {dayReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-1 text-red-600">
                    <Bell className="h-3 w-3" />
                    <span className="truncate">{reminder.title}</span>
                  </div>
                ))}
                
                {dayMeals.length > 0 && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Utensils className="h-3 w-3" />
                    <span className="truncate">{dayMeals.length} meals</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const { dayTasks, dayWorkouts, dayReminders, dayTimeBlocks, dayMeals } = getItemsForDate(selectedDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Time Blocks */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium">Time Blocks</h4>
              <Badge variant="outline">{dayTimeBlocks.length}</Badge>
            </div>
            <div className="space-y-2">
              {dayTimeBlocks.map((block) => (
                <div key={block.id} className="p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                  <div className="font-medium text-sm">{block.title}</div>
                  {block.start_time && block.end_time && (
                    <div className="text-xs text-gray-600">
                      {format(new Date(block.start_time), 'HH:mm')} - {format(new Date(block.end_time), 'HH:mm')}
                    </div>
                  )}
                </div>
              ))}
              {dayTimeBlocks.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">No time blocks scheduled</div>
              )}
            </div>
          </Card>
          
          {/* Tasks */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="h-5 w-5 text-orange-600" />
              <h4 className="font-medium">Tasks</h4>
              <Badge variant="outline">{dayTasks.length}</Badge>
            </div>
            <div className="space-y-2">
              {dayTasks.map((task) => (
                <div key={task.id} className="p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                  <div className="font-medium text-sm">{task.title}</div>
                  {task.description && (
                    <div className="text-xs text-gray-600">{task.description}</div>
                  )}
                </div>
              ))}
              {dayTasks.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">No tasks due</div>
              )}
            </div>
          </Card>
          
          {/* Workouts */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="h-5 w-5 text-green-600" />
              <h4 className="font-medium">Workouts</h4>
              <Badge variant="outline">{dayWorkouts.length}</Badge>
            </div>
            <div className="space-y-2">
              {dayWorkouts.map((workout) => (
                <div key={workout.id} className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                  <div className="font-medium text-sm">{workout.name}</div>
                  {workout.duration && (
                    <div className="text-xs text-gray-600">{workout.duration} minutes</div>
                  )}
                </div>
              ))}
              {dayWorkouts.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">No workouts planned</div>
              )}
            </div>
          </Card>
          
          {/* Reminders */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-5 w-5 text-red-600" />
              <h4 className="font-medium">Reminders</h4>
              <Badge variant="outline">{dayReminders.length}</Badge>
            </div>
            <div className="space-y-2">
              {dayReminders.map((reminder) => (
                <div key={reminder.id} className="p-2 bg-red-50 rounded border-l-4 border-red-400">
                  <div className="font-medium text-sm">{reminder.title}</div>
                  {reminder.due_date && (
                    <div className="text-xs text-gray-600">
                      {format(new Date(reminder.due_date), 'HH:mm')}
                    </div>
                  )}
                </div>
              ))}
              {dayReminders.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">No reminders set</div>
              )}
            </div>
          </Card>
          
          {/* Meals */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Utensils className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium">Meals</h4>
              <Badge variant="outline">{dayMeals.length}</Badge>
            </div>
            <div className="space-y-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                const typeMeals = dayMeals.filter(meal => meal.meal_type === mealType);
                return (
                  <div key={mealType} className="p-2 bg-blue-50 rounded">
                    <div className="font-medium text-sm capitalize">{mealType}</div>
                    {typeMeals.length > 0 ? (
                      <div className="text-xs text-gray-600">
                        {typeMeals.map(meal => meal.name).join(', ')}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Not planned</div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Calendar View</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, viewMode === 'week' ? -7 : -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-sm font-medium min-w-32 text-center">
              {viewMode === 'week' 
                ? `Week of ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')}`
                : format(selectedDate, 'MMM d, yyyy')
              }
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, viewMode === 'week' ? 7 : 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCalendar}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Calendar
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Day
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
        </div>
      </div>
      
      {/* Calendar Content */}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </Card>
  );
};
