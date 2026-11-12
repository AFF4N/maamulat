const URDU_MONTHS = [
  'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
  'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
];

const URDU_DAYS = [
  'اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'
];

/**
 * Returns YYYY-MM-DD for the local timezone
 */
export function getTodayLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a YYYY-MM-DD string into formatted Urdu date like "04 اکتوبر 2026"
 */
export function formatUrduDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2];
  const monthName = URDU_MONTHS[monthIdx] || parts[1];
  return `${day} ${monthName} ${year}`;
}

/**
 * Returns the Urdu day of week for a given date string
 */
export function getUrduDayName(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return URDU_DAYS[d.getDay()] || '';
}

/**
 * Converts YYYY-MM-DD into "Sunday, 4 Oct 2026"
 */
export function formatEnglishDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Returns previous day in YYYY-MM-DD format
 */
export function getYesterdayLocalDateString(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

/**
 * Adds or subtracts days from a YYYY-MM-DD date string
 */
export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

/**
 * Calculates calendar day difference (d1 - d2 in days)
 */
export function getDayDifference(dateStr1: string, dateStr2: string): number {
  const [y1, m1, d1] = dateStr1.split('-').map(Number);
  const [y2, m2, d2] = dateStr2.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, d1).getTime();
  const date2 = new Date(y2, m2 - 1, d2).getTime();
  return Math.round((date1 - date2) / (1000 * 60 * 60 * 24));
}

/**
 * Formats a YYYY-MM-DD date into Islamic Hijri date:
 * e.g. "23 Rabiʻ II 1448 AH (23 ربیع الثانی 1448ھ)"
 */
export function formatHijriDate(dateStr: string, adjustmentDays: number = 0): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    if (adjustmentDays !== 0) {
      d.setDate(d.getDate() + adjustmentDays);
    }

    // English Hijri
    const enFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const enHijri = enFormatter.format(d);

    // Urdu Hijri
    const urFormatter = new Intl.DateTimeFormat('ur-PK-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const urHijri = urFormatter.format(d).replace('ہجری', 'ھ');

    return `${enHijri} (${urHijri})`;
  } catch {
    return '';
  }
}

/**
 * Formats a YYYY-MM-DD date into Urdu Islamic Hijri date:
 * e.g. "10 جمادی الاول، 1448 ھ"
 */
export function formatUrduHijriDate(dateStr: string, adjustmentDays: number = 0): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    if (adjustmentDays !== 0) {
      d.setDate(d.getDate() + adjustmentDays);
    }

    const urFormatter = new Intl.DateTimeFormat('ur-PK-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return urFormatter.format(d).replace('ہجری', 'ھ').trim();
  } catch {
    return '';
  }
}

/**
 * Converts YYYY-MM-DD into a short date like "4 Oct"
 */
export function formatShortDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

/**
 * Parses a 12-hour ("11:30 PM") or 24-hour ("23:30") time string into
 * total minutes since midnight (0 to 1439). Returns null if invalid.
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const cleaned = timeStr.replace(/[\u200E\u200F\u2066-\u2069]/g, '').trim();
  if (!cleaned || cleaned === '--') return null;

  // Match 12-hour format e.g. "11:30 PM", "5:00 am", "12:15PM"
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const mins = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (hours < 1 || hours > 12 || mins < 0 || mins > 59) return null;
    if (period === 'AM') {
      if (hours === 12) hours = 0;
    } else {
      if (hours !== 12) hours += 12;
    }
    return hours * 60 + mins;
  }

  // Match 24-hour format e.g. "23:30", "05:00"
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const mins = parseInt(match24[2], 10);
    if (hours < 0 || hours > 23 || mins < 0 || mins > 59) return null;
    return hours * 60 + mins;
  }

  return null;
}

/**
 * Converts a time string ("11:30 PM" or "23:30") into 24-hour "HH:mm"
 * format suitable for <input type="time" value={...} />
 */
export function to24HourTime(timeStr: string, fallback: string = '23:30'): string {
  const totalMins = parseTimeToMinutes(timeStr) ?? parseTimeToMinutes(fallback) ?? 23 * 60 + 30;
  const hours = Math.floor(totalMins / 60) % 24;
  const mins = totalMins % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Converts a 24-hour ("23:30") or 12-hour ("11:30 pm") time string into
 * canonical 12-hour format "hh:mm AM/PM" (e.g. "11:30 PM", "05:00 AM").
 */
export function format12HourTime(timeStr: string, fallback: string = '11:30 PM'): string {
  if (timeStr === '--') return '--';
  const totalMins = parseTimeToMinutes(timeStr) ?? parseTimeToMinutes(fallback);
  if (totalMins === null) return timeStr || fallback;

  const hours24 = Math.floor(totalMins / 60) % 24;
  const mins = totalMins % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
}

/**
 * Shifts a time string by deltaMinutes (e.g. -15 or +15), wrapping around 24 hours,
 * and returns canonical 12-hour format "hh:mm AM/PM".
 */
export function shiftTimeByMinutes(
  timeStr: string,
  deltaMinutes: number,
  fallback: string = '11:30 PM'
): string {
  const baseMins = parseTimeToMinutes(timeStr) ?? parseTimeToMinutes(fallback) ?? 23 * 60 + 30;
  const wrappedMins = ((baseMins + deltaMinutes) % 1440 + 1440) % 1440;
  const hours24 = Math.floor(wrappedMins / 60);
  const mins = wrappedMins % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
}


