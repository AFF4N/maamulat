/**
 * Formats Hasanat numbers into compact human-readable strings (e.g. 1.2K, 150K, 1.2M, 1.5B).
 * Values under 1,000 are shown as exact integers.
 */
export function formatHasanat(value: number): string {
  const num = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;

  if (num < 1000) {
    return num.toString();
  }

  const units = [
    { threshold: 1_000_000_000, suffix: 'B' },
    { threshold: 1_000_000, suffix: 'M' },
    { threshold: 1_000, suffix: 'K' },
  ];

  for (let i = 0; i < units.length; i++) {
    const { threshold, suffix } = units[i];
    if (num >= threshold) {
      const scaled = num / threshold;
      const rounded = Math.round(scaled * 10) / 10;

      // Avoid "1000K" or "1000M" by promoting to the next unit
      if (rounded >= 1000 && i > 0) {
        const next = units[i - 1];
        const nextRounded = Math.round((num / next.threshold) * 10) / 10;
        const formattedNext = Number.isInteger(nextRounded) ? nextRounded.toString() : nextRounded.toFixed(1).replace(/\.0$/, '');
        return `${formattedNext}${next.suffix}`;
      }

      const formatted = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1).replace(/\.0$/, '');
      return `${formatted}${suffix}`;
    }
  }

  return num.toString();
}

const TILAWAT_PRESET_HASANAT: Record<string, number> = {
  'ایک رکوع': 5400,
  'ایک پاؤ': 27000,
  'آدھا پارہ': 54000,
  '1 پارہ': 108000,
  '2 پارے': 216000,
  '3 پارے': 324000,
};

/**
 * Normalizes Urdu/Arabic-Indic digits to Western ASCII digits so custom
 * Tilawat inputs like "۵ صفحات" or "2 پارے" parse reliably.
 */
function normalizeDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/**
 * Estimates authentic Tilawat Hasanat (10 hasanat per Arabic letter, Tirmidhi 2910)
 * dynamically from the user's selected preset or custom measure.
 * 1 Juz ≈ 10,800 letters = 108,000 H; 1 Paao = 27,000 H; 1 Ruku / 1 Page ≈ 5,400 H.
 */
export function estimateTilawatHasanat(measure: string): number {
  const trimmed = measure.trim();
  if (!trimmed) return 27000;

  if (TILAWAT_PRESET_HASANAT[trimmed] !== undefined) {
    return TILAWAT_PRESET_HASANAT[trimmed];
  }

  const normalized = normalizeDigits(trimmed).toLowerCase();
  const numMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  const count = numMatch ? Math.max(0.25, parseFloat(numMatch[1])) : 1;

  if (normalized.includes('آدھا') || normalized.includes('half')) {
    return Math.round(54000 * (numMatch ? count : 1));
  }
  if (normalized.includes('پار') || normalized.includes('juz') || normalized.includes('para')) {
    return Math.round(count * 108000);
  }
  if (normalized.includes('پاؤ') || normalized.includes('paao') || normalized.includes('quarter')) {
    return Math.round(count * 27000);
  }
  if (normalized.includes('صفح') || normalized.includes('page')) {
    return Math.round(count * 5400);
  }
  if (normalized.includes('رکوع') || normalized.includes('ruku')) {
    return Math.round(count * 5400);
  }
  if (normalized.includes('آیت') || normalized.includes('آیات') || normalized.includes('ayah') || normalized.includes('ayat') || normalized.includes('verse')) {
    return Math.round(count * 500);
  }

  return 27000;
}

export function toUrduDigits(num: number): string {
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(Math.round(num)).replace(/\d/g, (d) => urduDigits[Number(d)]);
}

// TODO(legacy-migration): Remove extractDhikrCount & removeDhikrCountFromTitle once existing localStorage users have migrated off baked-in title counts.
/**
 * Extracts a repetition count from legacy Dhikr task titles (e.g. "Astaghfirullah (150x)" or "استغفار ۱۵۰"),
 * ignoring English ordinals like "1st" or "3rd".
 */
export function extractDhikrCount(englishTitle: string, urduTitle: string): number | null {
  const cleanEnglish = normalizeDigits(englishTitle || '').replace(/\b\d+(st|nd|rd|th)\b/gi, '');
  const enMatch = cleanEnglish.match(/(\d+)\s*x?\b/i);
  if (enMatch) {
    const val = parseInt(enMatch[1], 10);
    if (val > 0) return val;
  }

  const cleanUrdu = normalizeDigits(urduTitle || '');
  const urMatch = cleanUrdu.match(/(\d+)/);
  if (urMatch) {
    const val = parseInt(urMatch[1], 10);
    if (val > 0) return val;
  }

  return null;
}

/**
 * Strips baked-in repetition counts from legacy Dhikr titles during migration,
 * preserving English ordinals like "1st" or "3rd".
 */
export function removeDhikrCountFromTitle(title: string, isUrdu: boolean = false): string {
  if (isUrdu) {
    return title
      .replace(/\s*\([۰-۹٠-٩\d]+\)\s*/g, ' ')
      .replace(/\s+[۰-۹٠-٩\d]+\s*$/g, '')
      .trim();
  }

  const withoutOrdinals = title.replace(/\b\d+(st|nd|rd|th)\b/gi, (m) => `__ORD_${m}__`);
  const cleaned = withoutOrdinals
    .replace(/\s*\(\s*\d+\s*x?\s*\)\s*/gi, ' ')
    .replace(/\s+\d+\s*x?\s*$/gi, '')
    .trim();

  return cleaned.replace(/__ORD_(\d+(?:st|nd|rd|th))__/gi, '$1');
}

