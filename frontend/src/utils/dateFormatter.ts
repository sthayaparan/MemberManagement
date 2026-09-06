// Formats an ISO date string (YYYY-MM-DD or a full ISO datetime) as "15 May 1980".
// Builds the Date from parts to avoid the UTC-shift you get from new Date('YYYY-MM-DD').
export function formatDate(dateString: string): string {
  if (!dateString) return '-';

  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
