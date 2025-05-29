
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useReminders } from '@/hooks/useReminders';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Trash2, Bell, Calendar } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

export const ReminderCenter = () => {
  const { user } = useAuth();
  const { 
    reminders, 
    isLoading, 
    createReminder, 
    deleteReminder,
    isCreating, 
    isDeleting
  } = useReminders();
  
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    due_date: ''
  });

  const handleCreateReminder = () => {
    if (!newReminder.title.trim() || !user) return;
    
    const reminderData = {
      user_id: user.id,
      title: newReminder.title.trim(),
      due_date: newReminder.due_date ? new Date(newReminder.due_date).toISOString() : undefined
    };
    
    createReminder(reminderData);
    setNewReminder({ title: '', due_date: '' });
    setIsCreatingNew(false);
  };

  const getReminderStatus = (reminder: any) => {
    if (!reminder.due_date) return 'none';
    const dueDate = new Date(reminder.due_date);
    
    if (isPast(dueDate) && !isToday(dueDate)) return 'overdue';
    if (isToday(dueDate)) return 'today';
    if (isTomorrow(dueDate)) return 'tomorrow';
    return 'upcoming';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
      case 'today':
        return <Badge className="text-xs bg-orange-500">Today</Badge>;
      case 'tomorrow':
        return <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">Tomorrow</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="text-xs">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const sortedReminders = reminders.sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  if (isLoading) {
    return (
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Reminder Center</h3>
        <Button 
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="flex items-center gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Reminder
        </Button>
      </div>

      {/* Create New Reminder Form */}
      {isCreatingNew && (
        <Card className="p-3 mb-4 bg-gray-50">
          <div className="space-y-3">
            <Input
              placeholder="Reminder title"
              value={newReminder.title}
              onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              type="datetime-local"
              value={newReminder.due_date}
              onChange={(e) => setNewReminder(prev => ({ ...prev, due_date: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateReminder}
                disabled={isCreating || !newReminder.title.trim()}
                size="sm"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Reminder'}
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

      {/* Reminders List */}
      <div className="space-y-2">
        {sortedReminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No reminders set</p>
          </div>
        ) : (
          sortedReminders.map((reminder) => {
            const status = getReminderStatus(reminder);
            return (
              <Card key={reminder.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className="h-4 w-4 text-gray-500" />
                      <h4 className="font-medium text-gray-800">{reminder.title}</h4>
                      {getStatusBadge(status)}
                    </div>
                    {reminder.due_date && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 ml-6">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(reminder.due_date), 'MMM d, yyyy h:mm a')}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteReminder(reminder.id)}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </Card>
  );
};
