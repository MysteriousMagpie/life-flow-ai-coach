
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsService } from '@/services/workoutsService';
import { Workout, CreateWorkout, UpdateWorkout } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { useEffect } from 'react';

export const useWorkouts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: workouts = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['workouts'],
    queryFn: workoutsService.getAll,
    enabled: !!user, // Only fetch when user is authenticated
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime:workouts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime workouts change:', payload);
          // Refetch workouts data when changes occur
          queryClient.invalidateQueries({ queryKey: ['workouts'] });
          
          // Show notification for new workouts
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Workout Added",
              description: `New workout "${payload.new.name}" has been scheduled`,
            });
          } else if (payload.eventType === 'UPDATE' && payload.new.is_completed && !payload.old.is_completed) {
            toast({
              title: "Workout Completed",
              description: `Workout "${payload.new.name}" has been completed`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, queryClient, toast]);

  const createMutation = useMutation({
    mutationFn: workoutsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast({
        title: "Success",
        description: "Workout created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create workout",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateWorkout }) =>
      workoutsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast({
        title: "Success",
        description: "Workout updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update workout",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: workoutsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast({
        title: "Success",
        description: "Workout deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete workout",
        variant: "destructive",
      });
    },
  });

  const completeWorkoutMutation = useMutation({
    mutationFn: workoutsService.markComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast({
        title: "Success",
        description: "Workout marked as complete",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete workout",
        variant: "destructive",
      });
    },
  });

  const incompleteWorkoutMutation = useMutation({
    mutationFn: workoutsService.markIncomplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast({
        title: "Success",
        description: "Workout marked as incomplete",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark workout incomplete",
        variant: "destructive",
      });
    },
  });

  return {
    workouts,
    isLoading,
    error,
    createWorkout: createMutation.mutate,
    updateWorkout: updateMutation.mutate,
    deleteWorkout: deleteMutation.mutate,
    completeWorkout: completeWorkoutMutation.mutate,
    incompleteWorkout: incompleteWorkoutMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCompleting: completeWorkoutMutation.isPending,
    isIncompleting: incompleteWorkoutMutation.isPending,
  };
};
