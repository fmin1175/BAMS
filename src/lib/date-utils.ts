/**
 * Get the current week number of the year
 */
export function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil((diff + (start.getDay() * 86400000)) / oneWeek);
}

/**
 * Get the start and end dates for a specific week number in a year
 */
export function getWeekDates(year: number, weekNumber: number) {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = firstDayOfYear.getDay() - 1; // Adjust for Monday as first day of week
  
  // Calculate the first day of the week
  const startDate = new Date(year, 0, 1 + (weekNumber - 1) * 7 - daysOffset);
  
  // Calculate the last day of the week
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  // Set times to beginning and end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}