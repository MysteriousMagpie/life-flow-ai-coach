
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Clock, Edit2, Trash2 } from 'lucide-react';
import { format, addMinutes, startOfDay } from 'date-fns';

export const TimelineScheduler = () => {
  const { user } = useAuth();
  const { timeBlocks, createTimeBlock, updateTimeBlock, deleteTimeBlock, isCreating } = useTimeBlocks();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newBlock, setNewBlock] = useState({
    title: '',
    startTime: '',
    endTime: '',
    category: 'work'
  });

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      label: format(addMinutes(startOfDay(new Date()), hour * 60), 'h:mm a')
    };
  });

  const getTodayBlocks = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return timeBlocks.filter(block => 
      block.start_time && format(new Date(block.start_time), 'yyyy-MM-dd') === dateStr
    ).sort((a, b) => 
      new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime()
    );
  };

  const handleCreateBlock = () => {
    if (!newBlock.title.trim() || !newBlock.startTime || !newBlock.endTime || !user) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startDateTime = new Date(`${dateStr}T${newBlock.startTime}`);
    const endDateTime = new Date(`${dateStr}T${newBlock.endTime}`);
    
    createTimeBlock({
      user_id: user.id,
      title: newBlock.title.trim(),
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      category: newBlock.category
    });
    
    setNewBlock({ title: '', startTime: '', endTime: '', category: 'work' });
    setIsCreatingNew(false);
  };

  const getBlockPosition = (block: any) => {
    if (!block.start_time || !block.end_time) return { top: 0, height: 0 };
    
    const start = new Date(block.start_time);
    const end = new Date(block.end_time);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    
    return {
      top: (startMinutes / 60) * 4, // 4rem per hour
      height: Math.max((duration / 60) * 4, 1) // minimum 1rem height
    };
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      work: 'bg-blue-500',
      personal: 'bg-green-500',
      health: 'bg-red-500',
      education: 'bg-purple-500',
      social: 'bg-yellow-500',
      other: 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const todayBlocks = getTodayBlocks();

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Timeline Scheduler</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-auto"
          />
          <Button 
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="flex items-center gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Block
          </Button>
        </div>
      </div>

      {/* Create New Block Form */}
      {isCreatingNew && (
        <Card className="p-3 mb-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <Input
              placeholder="Block title"
              value={newBlock.title}
              onChange={(e) => setNewBlock(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              type="time"
              value={newBlock.startTime}
              onChange={(e) => setNewBlock(prev => ({ ...prev, startTime: e.target.value }))}
            />
            <Input
              type="time"
              value={newBlock.endTime}
              onChange={(e) => setNewBlock(prev => ({ ...prev, endTime: e.target.value }))}
            />
            <select 
              value={newBlock.category} 
              onChange={(e) => setNewBlock(prev => ({ ...prev, category: e.target.value }))}
              className="border rounded px-3 py-2"
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="health">Health</option>
              <option value="education">Education</option>
              <option value="social">Social</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleCreateBlock}
              disabled={isCreating || !newBlock.title.trim()}
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
        </Card>
      )}

      {/* Timeline View */}
      <div className="flex">
        {/* Time Labels */}
        <div className="w-20 pr-4">
          {timeSlots.map(slot => (
            <div key={slot.time} className="h-16 flex items-start text-xs text-gray-500 font-medium">
              {slot.label}
            </div>
          ))}
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 relative">
          {/* Grid Lines */}
          <div className="absolute inset-0">
            {timeSlots.map((_, index) => (
              <div 
                key={index} 
                className="h-16 border-t border-gray-100 first:border-t-0"
                style={{ top: `${index * 4}rem` }}
              />
            ))}
          </div>

          {/* Time Blocks */}
          <div className="relative" style={{ height: `${24 * 4}rem` }}>
            {todayBlocks.map((block) => {
              const position = getBlockPosition(block);
              return (
                <div
                  key={block.id}
                  className={`absolute left-0 right-0 mx-1 rounded-lg p-2 text-white text-sm shadow-md ${getCategoryColor(block.category || 'other')}`}
                  style={{ 
                    top: `${position.top}rem`, 
                    height: `${position.height}rem` 
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{block.title}</div>
                      <div className="text-xs opacity-90">
                        {block.start_time && block.end_time && (
                          `${format(new Date(block.start_time), 'HH:mm')} - ${format(new Date(block.end_time), 'HH:mm')}`
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTimeBlock(block.id)}
                        className="h-6 w-6 p-0 hover:bg-white/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-1 bg-white/20 border-white/30 text-white text-xs">
                    {block.category}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{todayBlocks.length} time blocks scheduled</span>
          <div className="flex gap-4">
            {['work', 'personal', 'health'].map(category => {
              const count = todayBlocks.filter(block => block.category === category).length;
              return count > 0 ? (
                <div key={category} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${getCategoryColor(category)}`} />
                  <span className="capitalize">{category}: {count}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
