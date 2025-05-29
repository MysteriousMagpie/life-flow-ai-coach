
import { TimeBlock, Meal } from '@/types/database';
import { format, parseISO } from 'date-fns';

export interface ICSEvent {
  uid: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  category?: string;
}

export class CalendarGenerator {
  private static formatICSDate(date: Date): string {
    return format(date, "yyyyMMdd'T'HHmmss'Z'");
  }

  static generateICS(events: ICSEvent[]): string {
    const header = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Life Planning Assistant//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ].join('\r\n');

    const footer = 'END:VCALENDAR';

    const eventStrings = events.map(event => this.createICSEvent(event));
    
    return [header, ...eventStrings, footer].join('\r\n');
  }

  private static createICSEvent(event: ICSEvent): string {
    const now = new Date();
    const eventLines = [
      'BEGIN:VEVENT',
      `UID:${event.uid}@lifeplanningassistant.com`,
      `DTSTAMP:${this.formatICSDate(now)}`,
      `DTSTART:${this.formatICSDate(event.startDate)}`,
      `DTEND:${this.formatICSDate(event.endDate)}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      event.category ? `CATEGORIES:${event.category}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    ].filter(line => line !== '');

    return eventLines.join('\r\n');
  }

  static timeBlocksToICS(timeBlocks: TimeBlock[]): string {
    const events: ICSEvent[] = timeBlocks
      .filter(block => block.start_time && block.end_time)
      .map(block => ({
        uid: `timeblock-${block.id}`,
        title: block.title || 'Time Block',
        description: `Category: ${block.category || 'General'}${block.linked_task_id ? '\nLinked to task' : ''}`,
        startDate: new Date(block.start_time!),
        endDate: new Date(block.end_time!),
        category: block.category || 'general'
      }));

    return this.generateICS(events);
  }

  static mealsToICS(meals: Meal[]): string {
    const events: ICSEvent[] = meals
      .filter(meal => meal.planned_date)
      .map(meal => {
        const mealTime = this.getMealTime(meal.meal_type || 'breakfast');
        const startDate = new Date(`${meal.planned_date}T${mealTime}:00`);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

        return {
          uid: `meal-${meal.id}`,
          title: `${meal.meal_type || 'Meal'}: ${meal.name}`,
          description: [
            meal.instructions ? `Instructions: ${meal.instructions}` : '',
            meal.calories ? `Calories: ${meal.calories}` : '',
            meal.ingredients ? `Ingredients: ${JSON.parse(meal.ingredients as string).join(', ')}` : ''
          ].filter(Boolean).join('\n'),
          startDate,
          endDate,
          category: 'nutrition'
        };
      });

    return this.generateICS(events);
  }

  private static getMealTime(mealType: string): string {
    const mealTimes = {
      breakfast: '08:00',
      lunch: '12:30',
      dinner: '18:30',
      snack: '15:00'
    };
    return mealTimes[mealType as keyof typeof mealTimes] || '12:00';
  }

  static downloadICS(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
