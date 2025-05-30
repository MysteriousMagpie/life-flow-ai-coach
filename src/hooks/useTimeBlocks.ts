
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeBlocksService } from '@/services/timeBlocksService';
import { TimeBlock, CreateTimeBlock, UpdateTimeBlock } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useTimeBlocks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: timeBlocks = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['timeBlocks'],
    queryFn: timeBlocksService.getAll,
    enabled: !!user, // Only fetch when user is authenticated
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime:time_blocks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_blocks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime time_blocks change:', payload);
          // Refetch time blocks data when changes occur
          queryClient.invalidateQueries({ queryKey: ['timeBlocks'] });
          
          // Show notification for new time blocks
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Time Block Added",
              description: `New time block "${payload.new.title}" has been scheduled`,
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
    mutationFn: timeBlocksService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeBlocks'] });
      toast({
        title: "Success",
        description: "Time block created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create time block",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTimeBlock }) =>
      timeBlocksService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeBlocks'] });
      toast({
        title: "Success",
        description: "Time block updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update time block",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: timeBlocksService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeBlocks'] });
      toast({
        title: "Success",
        description: "Time block deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete time block",
        variant: "destructive",
      });
    },
  });

  return {
    timeBlocks,
    isLoading,
    error,
    createTimeBlock: createMutation.mutate,
    updateTimeBlock: updateMutation.mutate,
    deleteTimeBlock: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
