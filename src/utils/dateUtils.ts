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
export function formatHijriDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);

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
