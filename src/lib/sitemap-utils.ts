export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    const vercel = process.env.VERCEL_URL.replace(/\/$/, '');
    return vercel.startsWith('http') ? vercel : `https://${vercel}`;
  }
  return 'http://localhost:3000';
}

/**
 * Format date into ISO 8601 string with Asia/Kolkata (+05:30) timezone offset.
 * Example: "2026-08-23T19:45:00+05:30"
 */
export function formatToISTISO(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) {
    return formatToISTISO(new Date());
  }
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return formatToISTISO(new Date());
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  let hour = getPart('hour');
  if (hour === '24') hour = '00';
  const minute = getPart('minute');
  const second = getPart('second');

  return `${year}-${month}-${day}T${hour}:${minute}:${second}+05:30`;
}

/**
 * Get YYYY-MM in Asia/Kolkata (IST) timezone.
 */
export function getYearMonthInIST(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
  });

  return formatter.format(date);
}

/**
 * Escape special XML characters in text or URLs
 */
export function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
