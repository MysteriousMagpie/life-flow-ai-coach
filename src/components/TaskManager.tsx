
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Trash2, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const TaskManager = () => {
  const { user } = useAuth();
  const { 
    tasks, 
    pendingTasks, 
    completedTasks, 
    overdueTasks,
    isLoading, 
    createTask, 
    deleteTask, 
    completeTask,
    incompleteTask,
    isCreating, 
    isDeleting,
    isCompleting 
  } = useTasks();
  
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: ''
  });

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('pending');

  const handleCreateTask = () => {
    if (!newTask.title.trim() || !user) return;
    
    const taskData = {
      user_id: user.id,
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : undefined
    };
    
    createTask(taskData);
    setNewTask({ title: '', description: '', due_date: '' });
    setIsCreatingNew(false);
  };

  const handleToggleTask = (task: any) => {
    if (task.is_completed) {
      incompleteTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'pending':
        return pendingTasks;
      case 'completed':
        return completedTasks;
      case 'overdue':
        return overdueTasks;
      default:
        return tasks;
    }
  };

  const getTaskPriority = (task: any) => {
    if (!task.due_date) return 'none';
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 1) return 'urgent';
    if (diffDays <= 3) return 'high';
    return 'normal';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'overdue':
        return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
      case 'urgent':
        return <Badge variant="destructive" className="text-xs bg-orange-500">Urgent</Badge>;
      case 'high':
        return <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">High</Badge>;
      case 'normal':
        return <Badge variant="outline" className="text-xs">Normal</Badge>;
      default:
        return null;
    }
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

  const filteredTasks = getFilteredTasks();

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Task Manager</h3>
        <Button 
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="flex items-center gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'pending', label: 'Pending', count: pendingTasks.length },
          { key: 'overdue', label: 'Overdue', count: overdueTasks.length },
          { key: 'completed', label: 'Completed', count: completedTasks.length },
          { key: 'all', label: 'All', count: tasks.length }
        ].map(({ key, label, count }) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key as any)}
            className="text-xs"
          >
            {label} ({count})
          </Button>
        ))}
      </div>

      {/* Create New Task Form */}
      {isCreatingNew && (
        <Card className="p-3 mb-4 bg-gray-50">
          <div className="space-y-3">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
            <Input
              type="datetime-local"
              value={newTask.due_date}
              onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateTask}
                disabled={isCreating || !newTask.title.trim()}
                size="sm"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Task'}
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

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No {filter !== 'all' ? filter : ''} tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const priority = getTaskPriority(task);
            return (
              <Card key={task.id} className={`p-3 ${task.is_completed ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.is_completed}
                    onCheckedChange={() => handleToggleTask(task)}
                    disabled={isCompleting}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.title}
                      </h4>
                      {getPriorityBadge(priority)}
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.due_date), 'MMM d, yyyy h:mm a')}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
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
