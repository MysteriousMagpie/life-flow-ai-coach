
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { Brain, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, addDays, isAfter, isBefore, addHours } from 'date-fns';

interface ScheduleSuggestion {
  type: 'time-block' | 'reschedule' | 'break' | 'optimization';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  timeSlot?: string;
}

export const SchedulingAssistant = () => {
  const { pendingTasks, overdueTasks } = useTasks();
  const { workouts } = useWorkouts();
  const { timeBlocks } = useTimeBlocks();
  
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSchedule = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const newSuggestions: ScheduleSuggestion[] = [];
      
      // Check for scheduling conflicts
      const today = new Date();
      const todayBlocks = timeBlocks.filter(block => 
        block.start_time && format(new Date(block.start_time), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      ).sort((a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime());
      
      // Look for gaps in schedule
      for (let i = 0; i < todayBlocks.length - 1; i++) {
        const currentEnd = new Date(todayBlocks[i].end_time!);
        const nextStart = new Date(todayBlocks[i + 1].start_time!);
        const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);
        
        if (gapMinutes >= 30 && gapMinutes <= 120) {
          newSuggestions.push({
            type: 'time-block',
            title: 'Fill Schedule Gap',
            description: `You have a ${Math.round(gapMinutes)}-minute gap between ${format(currentEnd, 'HH:mm')} and ${format(nextStart, 'HH:mm')}`,
            action: `Schedule a task or break during ${format(currentEnd, 'HH:mm')}-${format(nextStart, 'HH:mm')}`,
            priority: 'medium',
            timeSlot: `${format(currentEnd, 'HH:mm')}-${format(nextStart, 'HH:mm')}`
          });
        }
      }
      
      // Check for overdue tasks
      if (overdueTasks.length > 0) {
        newSuggestions.push({
          type: 'reschedule',
          title: 'Reschedule Overdue Tasks',
          description: `You have ${overdueTasks.length} overdue tasks that need immediate attention`,
          action: 'Create time blocks for overdue tasks today',
          priority: 'high'
        });
      }
      
      // Check for missing workouts
      const recentWorkouts = workouts.filter(w => 
        w.shceduled_date && isAfter(new Date(w.shceduled_date), addDays(today, -7))
      );
      
      if (recentWorkouts.length < 3) {
        newSuggestions.push({
          type: 'time-block',
          title: 'Schedule Workout Time',
          description: 'You\'ve had fewer than 3 workouts this week',
          action: 'Block time for a 30-45 minute workout session',
          priority: 'medium',
          timeSlot: 'Morning or Evening'
        });
      }
      
      // Check for work-life balance
      const workBlocks = todayBlocks.filter(block => block.category === 'work');
      const personalBlocks = todayBlocks.filter(block => block.category === 'personal');
      
      if (workBlocks.length > personalBlocks.length * 2) {
        newSuggestions.push({
          type: 'optimization',
          title: 'Improve Work-Life Balance',
          description: 'Your schedule is heavily work-focused today',
          action: 'Schedule some personal time or relaxation',
          priority: 'medium'
        });
      }
      
      // Check for break recommendations
      const longWorkBlocks = workBlocks.filter(block => {
        if (!block.start_time || !block.end_time) return false;
        const duration = (new Date(block.end_time).getTime() - new Date(block.start_time).getTime()) / (1000 * 60);
        return duration > 120; // 2+ hours
      });
      
      if (longWorkBlocks.length > 0) {
        newSuggestions.push({
          type: 'break',
          title: 'Add Break Time',
          description: `You have ${longWorkBlocks.length} work blocks longer than 2 hours`,
          action: 'Consider adding 15-minute breaks every 90 minutes',
          priority: 'low'
        });
      }
      
      // Productivity optimization
      if (pendingTasks.length > 5) {
        newSuggestions.push({
          type: 'optimization',
          title: 'Task Prioritization Needed',
          description: `You have ${pendingTasks.length} pending tasks`,
          action: 'Consider using time-blocking to tackle high-priority tasks first',
          priority: 'medium'
        });
      }
      
      setSuggestions(newSuggestions);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800">Scheduling Assistant</h3>
        </div>
        
        <Button 
          onClick={analyzeSchedule}
          disabled={isAnalyzing}
          className="flex items-center gap-2"
          size="sm"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              Analyze Schedule
            </>
          )}
        </Button>
      </div>

      {suggestions.length === 0 && !isAnalyzing && (
        <div className="text-center py-8 text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Click "Analyze Schedule" to get intelligent scheduling suggestions</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Recommendations</h4>
            <Badge variant="outline">{suggestions.length} suggestions</Badge>
          </div>
          
          {suggestions.map((suggestion, index) => (
            <Card key={index} className={`p-3 ${getPriorityColor(suggestion.priority)} border`}>
              <div className="flex items-start gap-3">
                {getPriorityIcon(suggestion.priority)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-800">{suggestion.title}</h5>
                    <Badge variant="outline" className="text-xs capitalize">
                      {suggestion.type.replace('-', ' ')}
                    </Badge>
                    <Badge 
                      variant={suggestion.priority === 'high' ? 'destructive' : 'outline'} 
                      className="text-xs capitalize"
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                      💡 {suggestion.action}
                    </p>
                    {suggestion.timeSlot && (
                      <Badge variant="outline" className="text-xs">
                        {suggestion.timeSlot}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-600">{timeBlocks.length}</div>
            <div className="text-xs text-gray-600">Time Blocks</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-orange-600">{pendingTasks.length}</div>
            <div className="text-xs text-gray-600">Pending Tasks</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">{workouts.length}</div>
            <div className="text-xs text-gray-600">Workouts</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
