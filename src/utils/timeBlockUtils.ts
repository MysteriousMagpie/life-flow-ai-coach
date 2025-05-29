
import { TimeBlock, CreateTimeBlock } from '@/types/database';
import { addDays, startOfWeek, setHours, setMinutes } from 'date-fns';

export interface SchedulingConflict {
  conflictingBlock: TimeBlock;
  suggestedAlternatives: Date[];
}

export class TimeBlockUtils {
  static detectConflicts(
    newBlock: CreateTimeBlock, 
    existingBlocks: TimeBlock[]
  ): SchedulingConflict | null {
    if (!newBlock.start_time || !newBlock.end_time) return null;

    const newStart = new Date(newBlock.start_time);
    const newEnd = new Date(newBlock.end_time);

    const conflict = existingBlocks.find(block => {
      if (!block.start_time || !block.end_time) return false;
      
      const blockStart = new Date(block.start_time);
      const blockEnd = new Date(block.end_time);
      
      return (newStart < blockEnd && newEnd > blockStart);
    });

    if (conflict) {
      return {
        conflictingBlock: conflict,
        suggestedAlternatives: this.findAlternativeSlots(newStart, newEnd, existingBlocks)
      };
    }

    return null;
  }

  static findAlternativeSlots(
    preferredStart: Date, 
    preferredEnd: Date, 
    existingBlocks: TimeBlock[]
  ): Date[] {
    const duration = preferredEnd.getTime() - preferredStart.getTime();
    const alternatives: Date[] = [];
    
    // Try same day, different times
    const sameDay = new Date(preferredStart);
    for (let hour = 8; hour <= 20; hour++) {
      const slotStart = setMinutes(setHours(sameDay, hour), 0);
      const slotEnd = new Date(slotStart.getTime() + duration);
      
      if (!this.hasConflict(slotStart, slotEnd, existingBlocks)) {
        alternatives.push(slotStart);
        if (alternatives.length >= 3) break;
      }
    }

    // Try next few days if not enough alternatives
    if (alternatives.length < 3) {
      for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
        const nextDay = addDays(preferredStart, dayOffset);
        const slotStart = setMinutes(setHours(nextDay, preferredStart.getHours()), preferredStart.getMinutes());
        const slotEnd = new Date(slotStart.getTime() + duration);
        
        if (!this.hasConflict(slotStart, slotEnd, existingBlocks)) {
          alternatives.push(slotStart);
          if (alternatives.length >= 3) break;
        }
      }
    }

    return alternatives;
  }

  private static hasConflict(start: Date, end: Date, existingBlocks: TimeBlock[]): boolean {
    return existingBlocks.some(block => {
      if (!block.start_time || !block.end_time) return false;
      
      const blockStart = new Date(block.start_time);
      const blockEnd = new Date(block.end_time);
      
      return (start < blockEnd && end > blockStart);
    });
  }

  static rescheduleEvent(
    eventId: string, 
    newDateTime: Date, 
    existingBlocks: TimeBlock[],
    reason?: string
  ): { success: boolean; conflict?: SchedulingConflict } {
    console.log(`Rescheduling event ${eventId} to ${newDateTime.toISOString()}. Reason: ${reason}`);
    
    // Find the original block
    const originalBlock = existingBlocks.find(block => block.id === eventId);
    if (!originalBlock || !originalBlock.start_time || !originalBlock.end_time) {
      return { success: false };
    }

    // Calculate duration
    const duration = new Date(originalBlock.end_time).getTime() - new Date(originalBlock.start_time).getTime();
    const newEndTime = new Date(newDateTime.getTime() + duration);

    // Create temporary block for conflict detection
    const tempBlock: CreateTimeBlock = {
      user_id: originalBlock.user_id!,
      title: originalBlock.title!,
      start_time: newDateTime.toISOString(),
      end_time: newEndTime.toISOString(),
      category: originalBlock.category
    };

    // Check for conflicts (excluding the original block)
    const otherBlocks = existingBlocks.filter(block => block.id !== eventId);
    const conflict = this.detectConflicts(tempBlock, otherBlocks);

    if (conflict) {
      return { success: false, conflict };
    }

    return { success: true };
  }

  static generateSmartSchedule(
    activities: Array<{ title: string; duration: number; category: string; preferred_time?: string }>,
    constraints: { workingHours: [number, number]; breakDuration: number } = { workingHours: [9, 17], breakDuration: 15 }
  ): CreateTimeBlock[] {
    const schedule: CreateTimeBlock[] = [];
    const startOfCurrentWeek = startOfWeek(new Date());
    
    let currentDay = 0;
    let currentHour = constraints.workingHours[0];

    activities.forEach((activity, index) => {
      const scheduledDate = addDays(startOfCurrentWeek, currentDay);
      const startTime = setMinutes(setHours(scheduledDate, currentHour), 0);
      const endTime = new Date(startTime.getTime() + activity.duration * 60 * 1000);

      schedule.push({
        user_id: '', // Will be set by the calling function
        title: activity.title,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        category: activity.category
      });

      // Update scheduling position
      currentHour += Math.ceil(activity.duration / 60);
      if (currentHour >= constraints.workingHours[1]) {
        currentDay++;
        currentHour = constraints.workingHours[0];
      }
    });

    return schedule;
  }
}
