
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

export const getCalendarDays = (date: Date) => {
  const firstDayOfMonth = startOfMonth(date);
  const lastDayOfMonth = endOfMonth(date);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });
  
  return eachDayOfInterval({ start: startDate, end: endDate });
};
