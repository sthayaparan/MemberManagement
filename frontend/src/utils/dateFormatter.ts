export function formatDate(dateString: string): string {
  if (!dateString) return '-';

  try {
    // Parse ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
    // Split by 'T' to get just the date part
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');

    // Validate parsed values
    if (!year || !month || !day) {
      console.warn(`[formatDate] Invalid date parts: year=${year}, month=${month}, day=${day} from "${dateString}"`);
      return 'Invalid Date';
    }

    // Create date from components to avoid timezone issues
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn(`[formatDate] Invalid date result from "${dateString}"`);
      return 'Invalid Date';
    }

    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return formatted;
  } catch (error) {
    console.error(`[formatDate] Error formatting date "${dateString}":`, error);
    return 'Invalid Date';
  }
}
