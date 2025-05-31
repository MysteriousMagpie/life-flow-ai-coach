import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealsService } from '@/services/mealsService';
import { Meal, CreateMeal, UpdateMeal } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useMeals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: meals = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['meals'],
    queryFn: mealsService.getAll,
    enabled: !!user, // Only fetch when user is authenticated
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime:meals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meals',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime meals change:', payload);
          // Refetch meals data when changes occur
          queryClient.invalidateQueries({ queryKey: ['meals'] });
          
          // Show notification for new meals
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Meal Added",
              description: `New meal "${payload.new.name}" has been added`,
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
    mutationFn: mealsService.create,
    onMutate: async (newMeal) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['meals'] });

      // Snapshot the previous value
      const previousMeals = queryClient.getQueryData(['meals']);

      // Optimistically update to the new value
      const optimisticMeal = {
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...newMeal,
      };
      
      queryClient.setQueryData(['meals'], (old: Meal[] = []) => [optimisticMeal, ...old]);

      // Return a context with the previous and new meal
      return { previousMeals, optimisticMeal };
    },
    onError: (error: any, newMeal, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousMeals) {
        queryClient.setQueryData(['meals'], context.previousMeals);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create meal",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to sync with server state
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Meal created successfully",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateMeal }) =>
      mealsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      toast({
        title: "Success",
        description: "Meal updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update meal",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: mealsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      toast({
        title: "Success",
        description: "Meal deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete meal",
        variant: "destructive",
      });
    },
  });

  // Additional hooks for specific queries
  const useMealsByDate = (date: string) => useQuery({
    queryKey: ['meals', 'date', date],
    queryFn: () => mealsService.getByDate(date),
    enabled: !!date && !!user,
  });

  const useMealsByDateRange = (startDate: string, endDate: string) => useQuery({
    queryKey: ['meals', 'dateRange', startDate, endDate],
    queryFn: () => mealsService.getByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate && !!user,
  });

  return {
    meals,
    isLoading,
    error,
    createMeal: createMutation.mutate,
    updateMeal: updateMutation.mutate,
    deleteMeal: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    useMealsByDate,
    useMealsByDateRange,
  };
};
