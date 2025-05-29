
import { toast } from '@/hooks/use-toast';

export interface AppError extends Error {
  code?: string;
  details?: any;
}

export const handleError = (error: AppError, context?: string) => {
  console.error(`Error in ${context}:`, error);
  
  let message = error.message || 'An unexpected error occurred';
  
  // Handle specific Supabase errors
  if (error.message?.includes('JWT')) {
    message = 'Session expired. Please log in again.';
  } else if (error.message?.includes('violates row-level security')) {
    message = 'You do not have permission to perform this action.';
  } else if (error.message?.includes('duplicate key value')) {
    message = 'This item already exists.';
  } else if (error.message?.includes('foreign key constraint')) {
    message = 'Cannot delete this item as it is being used elsewhere.';
  }
  
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
  
  return error;
};

export const handleSuccess = (message: string) => {
  toast({
    title: "Success",
    description: message,
  });
};
