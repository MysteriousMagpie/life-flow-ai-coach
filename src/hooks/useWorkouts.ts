
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsService } from '@/services/workoutsService';
import { Workout, CreateWorkout, UpdateWorkout } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useWorkouts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: workouts = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['workouts'],
    queryFn: workoutsService.getAll,
  });

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

  const completeMutation = useMutation({
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

  const incompleteMutation = useMutation({
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
    completeWorkout: completeMutation.mutate,
    incompleteWorkout: incompleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCompleting: completeMutation.isPending,
    isIncompleting: incompleteMutation.isPending,
  };
};
