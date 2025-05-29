
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Trash2, Play, CheckCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const WorkoutTracker = () => {
  const { user } = useAuth();
  const { 
    workouts, 
    isLoading, 
    createWorkout, 
    deleteWorkout, 
    completeWorkout,
    incompleteWorkout,
    isCreating, 
    isDeleting,
    isCompleting 
  } = useWorkouts();
  
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    intensity: 'moderate',
    duration: '',
    scheduled_date: ''
  });

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  const handleCreateWorkout = () => {
    if (!newWorkout.name.trim() || !user) return;
    
    const workoutData = {
      user_id: user.id,
      name: newWorkout.name.trim(),
      intensity: newWorkout.intensity,
      duration: newWorkout.duration ? parseInt(newWorkout.duration) : undefined,
      shceduled_date: newWorkout.scheduled_date || new Date().toISOString().split('T')[0]
    };
    
    createWorkout(workoutData);
    setNewWorkout({ name: '', intensity: 'moderate', duration: '', scheduled_date: '' });
    setIsCreatingNew(false);
  };

  const handleToggleWorkout = (workout: any) => {
    if (workout.is_completed) {
      incompleteWorkout(workout.id);
    } else {
      completeWorkout(workout.id);
    }
  };

  const getFilteredWorkouts = () => {
    switch (filter) {
      case 'upcoming':
        return workouts.filter(w => !w.is_completed);
      case 'completed':
        return workouts.filter(w => w.is_completed);
      default:
        return workouts;
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'extreme':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const filteredWorkouts = getFilteredWorkouts();

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Workout Tracker</h3>
        <Button 
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="flex items-center gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Workout
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' },
          { key: 'all', label: 'All' }
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key as any)}
            className="text-xs"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Create New Workout Form */}
      {isCreatingNew && (
        <Card className="p-3 mb-4 bg-gray-50">
          <div className="space-y-3">
            <Input
              placeholder="Workout name"
              value={newWorkout.name}
              onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={newWorkout.intensity} onValueChange={(value) => setNewWorkout(prev => ({ ...prev, intensity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="extreme">Extreme</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Duration (min)"
                value={newWorkout.duration}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>
            <Input
              type="date"
              value={newWorkout.scheduled_date}
              onChange={(e) => setNewWorkout(prev => ({ ...prev, scheduled_date: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateWorkout}
                disabled={isCreating || !newWorkout.name.trim()}
                size="sm"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Workout'}
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

      {/* Workouts List */}
      <div className="space-y-2">
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No {filter !== 'all' ? filter : ''} workouts found</p>
          </div>
        ) : (
          filteredWorkouts.map((workout) => (
            <Card key={workout.id} className={`p-3 ${workout.is_completed ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${workout.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {workout.name}
                    </h4>
                    {workout.is_completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {workout.intensity && (
                      <Badge className={`text-xs ${getIntensityColor(workout.intensity)}`}>
                        {workout.intensity}
                      </Badge>
                    )}
                    {workout.duration && <span>{workout.duration} min</span>}
                    {workout.shceduled_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(workout.shceduled_date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={workout.is_completed ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleWorkout(workout)}
                    disabled={isCompleting}
                    className="text-xs"
                  >
                    {workout.is_completed ? 'Undo' : 'Complete'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteWorkout(workout.id)}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
};
