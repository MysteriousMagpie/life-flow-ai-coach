
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '@/services/tasksService';
import { Task, CreateTask, UpdateTask } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useTasks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksService.getAll,
  });

  const {
    data: pendingTasks = [],
    isLoading: isPendingLoading
  } = useQuery({
    queryKey: ['tasks', 'pending'],
    queryFn: tasksService.getPending,
  });

  const {
    data: completedTasks = [],
    isLoading: isCompletedLoading
  } = useQuery({
    queryKey: ['tasks', 'completed'],
    queryFn: tasksService.getCompleted,
  });

  const {
    data: overdueTasks = [],
    isLoading: isOverdueLoading
  } = useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: tasksService.getOverdue,
  });

  const createMutation = useMutation({
    mutationFn: tasksService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTask }) =>
      tasksService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tasksService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: tasksService.markComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task marked as complete",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete task",
        variant: "destructive",
      });
    },
  });

  const incompleteMutation = useMutation({
    mutationFn: tasksService.markIncomplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task marked as incomplete",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark task incomplete",
        variant: "destructive",
      });
    },
  });

  return {
    tasks,
    pendingTasks,
    completedTasks,
    overdueTasks,
    isLoading,
    isPendingLoading,
    isCompletedLoading,
    isOverdueLoading,
    error,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    completeTask: completeMutation.mutate,
    incompleteTask: incompleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCompleting: completeMutation.isPending,
    isIncompleting: incompleteMutation.isPending,
  };
};
