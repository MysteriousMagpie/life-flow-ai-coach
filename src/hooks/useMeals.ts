
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealsService } from '@/services/mealsService';
import { Meal, CreateMeal, UpdateMeal } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
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
    enabled: !!user,
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
          
          // Invalidate and refetch to ensure UI updates
          queryClient.invalidateQueries({ queryKey: ['meals'] });
          
          // Only show notification for successful UI updates
          if (payload.eventType === 'INSERT') {
            // Wait a bit for the query to update, then show toast
            setTimeout(() => {
              const updatedMeals = queryClient.getQueryData(['meals']) as Meal[] | undefined;
              if (updatedMeals?.some(meal => meal.id === payload.new.id)) {
                toast({
                  title: "Meal Added",
                  description: `"${payload.new.name}" has been added to your meal planner`,
                });
              }
            }, 500);
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

      return { previousMeals, optimisticMeal };
    },
    onError: (error: any, newMeal, context) => {
      // Roll back on error
      if (context?.previousMeals) {
        queryClient.setQueryData(['meals'], context.previousMeals);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create meal",
        variant: "destructive",
      });
    },
    onSuccess: (data, variables, context) => {
      // Ensure UI is updated before showing success toast
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      
      // Wait for the query to update, then show success toast
      setTimeout(() => {
        const updatedMeals = queryClient.getQueryData(['meals']) as Meal[] | undefined;
        if (updatedMeals?.some(meal => meal.name === data.name)) {
          toast({
            title: "Success",
            description: `"${data.name}" has been added to your meal planner`,
          });
        }
      }, 300);
    },
    onSettled: () => {
      // Always refetch to sync with server state
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateMeal }) =>
      mealsService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      
      // Only show toast after confirming UI update
      setTimeout(() => {
        const updatedMeals = queryClient.getQueryData(['meals']) as Meal[] | undefined;
        if (updatedMeals?.some(meal => meal.id === data.id)) {
          toast({
            title: "Success",
            description: "Meal updated successfully",
          });
        }
      }, 300);
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
