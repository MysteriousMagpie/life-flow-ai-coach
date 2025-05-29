
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersService } from '@/services/remindersService';
import { Reminder, CreateReminder, UpdateReminder } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useReminders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: reminders = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['reminders'],
    queryFn: remindersService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: remindersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast({
        title: "Success",
        description: "Reminder created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create reminder",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateReminder }) =>
      remindersService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast({
        title: "Success",
        description: "Reminder updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update reminder",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: remindersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast({
        title: "Success",
        description: "Reminder deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete reminder",
        variant: "destructive",
      });
    },
  });

  return {
    reminders,
    isLoading,
    error,
    createReminder: createMutation.mutate,
    updateReminder: updateMutation.mutate,
    deleteReminder: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
