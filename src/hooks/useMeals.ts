
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealsService } from '@/services/mealsService';
import { Meal, CreateMeal, UpdateMeal } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useMeals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: meals = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['meals'],
    queryFn: mealsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: mealsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      toast({
        title: "Success",
        description: "Meal created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create meal",
        variant: "destructive",
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
  };
};
