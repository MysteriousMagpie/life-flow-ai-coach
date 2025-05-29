
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { format, startOfDay, endOfDay, isToday, isTomorrow } from 'date-fns';

export const TimeBlockScheduler = () => {
  const { user } = useAuth();
  const { 
    timeBlocks, 
    isLoading, 
    createTimeBlock, 
    deleteTimeBlock,
    isCreating, 
    isDeleting
  } = useTimeBlocks();
  
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTimeBlock, setNewTimeBlock] = useState({
    title: '',
    category: 'work',
    start_time: '',
    end_time: ''
  });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCreateTimeBlock = () => {
    if (!newTimeBlock.title.trim() || !newTimeBlock.start_time || !newTimeBlock.end_time || !user) return;
    
    const timeBlockData = {
      user_id: user.id,
      title: newTimeBlock.title.trim(),
      category: newTimeBlock.category,
      start_time: new Date(newTimeBlock.start_time).toISOString(),
      end_time: new Date(newTimeBlock.end_time).toISOString()
    };
    
    createTimeBlock(timeBlockData);
    setNewTimeBlock({ title: '', category: 'work', start_time: '', end_time: '' });
    setIsCreatingNew(false);
  };

  const getTimeBlocksForDate = (date: string) => {
    const startDate = startOfDay(new Date(date));
    const endDate = endOfDay(new Date(date));
    
    return timeBlocks.filter(block => {
      if (!block.start_time) return false;
      const blockDate = new Date(block.start_time);
      return blockDate >= startDate && blockDate <= endDate;
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work':
        return 'bg-blue-100 text-blue-800';
      case 'personal':
        return 'bg-green-100 text-green-800';
      case 'health':
        return 'bg-red-100 text-red-800';
      case 'social':
        return 'bg-purple-100 text-purple-800';
      case 'learning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  const getDateLabel = (date: string) => {
    const dateObj = new Date(date);
    if (isToday(dateObj)) return 'Today';
    if (isTomorrow(dateObj)) return 'Tomorrow';
    return format(dateObj, 'EEEE, MMM d');
  };

  if (isLoading) {
    return (
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  const dailyTimeBlocks = getTimeBlocksForDate(selectedDate);

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Time Block Scheduler</h3>
        <Button 
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="flex items-center gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Block
        </Button>
      </div>

      {/* Date Selector */}
      <div className="mb-4">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-48"
        />
        <p className="text-sm text-gray-600 mt-1">{getDateLabel(selectedDate)}</p>
      </div>

      {/* Create New Time Block Form */}
      {isCreatingNew && (
        <Card className="p-3 mb-4 bg-gray-50">
          <div className="space-y-3">
            <Input
              placeholder="Time block title"
              value={newTimeBlock.title}
              onChange={(e) => setNewTimeBlock(prev => ({ ...prev, title: e.target.value }))}
            />
            <Select value={newTimeBlock.category} onValueChange={(value) => setNewTimeBlock(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="datetime-local"
                value={newTimeBlock.start_time}
                onChange={(e) => setNewTimeBlock(prev => ({ ...prev, start_time: e.target.value }))}
                placeholder="Start time"
              />
              <Input
                type="datetime-local"
                value={newTimeBlock.end_time}
                onChange={(e) => setNewTimeBlock(prev => ({ ...prev, end_time: e.target.value }))}
                placeholder="End time"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateTimeBlock}
                disabled={isCreating || !newTimeBlock.title.trim() || !newTimeBlock.start_time || !newTimeBlock.end_time}
                size="sm"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Block'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreatingNew(false)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Time Blocks List */}
      <div className="space-y-2">
        {dailyTimeBlocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No time blocks scheduled for {getDateLabel(selectedDate).toLowerCase()}</p>
          </div>
        ) : (
          dailyTimeBlocks.map((timeBlock) => (
            <Card key={timeBlock.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <h4 className="font-medium text-gray-800">{timeBlock.title}</h4>
                    <Badge className={`text-xs ${getCategoryColor(timeBlock.category)}`}>
                      {timeBlock.category}
                    </Badge>
                  </div>
                  {timeBlock.start_time && timeBlock.end_time && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 ml-6">
                      <Calendar className="h-3 w-3" />
                      {formatTimeRange(timeBlock.start_time, timeBlock.end_time)}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTimeBlock(timeBlock.id)}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
};
