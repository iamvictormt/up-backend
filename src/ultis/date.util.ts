export function getNextPeriodEnd(startDate: Date): Date {
  const nextMonth = new Date(startDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  if (nextMonth.getDate() < startDate.getDate()) {
    nextMonth.setDate(0);
  }

  return nextMonth;
}
