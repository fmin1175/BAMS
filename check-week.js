// Function to get week number from date
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Check the week number for October 18, 2025
const sessionDate = new Date('2025-10-18');
const weekNumber = getWeekNumber(sessionDate);

console.log('Session date:', sessionDate.toISOString());
console.log('Week number:', weekNumber);
console.log('Current date:', new Date().toISOString());
console.log('Current week:', getWeekNumber(new Date()));

// Test the getWeekDates function
const { getWeekDates } = require('./src/lib/date-utils');

console.log('\nTesting getWeekDates for week', weekNumber);
const { startDate, endDate } = getWeekDates(2025, weekNumber);
console.log('Week', weekNumber, 'dates:', { startDate, endDate });

console.log('\nTesting getWeekDates for week 1');
const week1 = getWeekDates(2025, 1);
console.log('Week 1 dates:', week1);