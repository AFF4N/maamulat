import type { MaamulatState, DayRecord } from '../types';
import { formatUrduDate } from './dateUtils';

/**
 * Generates the authentic WhatsApp formatted text report
 * matching the user's daily spiritual habit tracker.
 */
export function generateWhatsAppReport(state: MaamulatState): string {
  const urduDate = formatUrduDate(state.todayDate);

  const lines: string[] = [];

  // Goal & Date Header (e.g. *ہدف یوم:* 7/40)
  const currentDay = state.goalDay ?? state.chillaDay ?? 1;
  const targetDays = state.goalMaxDays ?? state.chillaMaxDays ?? 40;
  lines.push(`*ہدف یوم:* ${currentDay}/${targetDays}`);
  lines.push(`*تاریخ:* ${urduDate}`);
  lines.push('');

  // Active categories & tasks
  const categories = state.categories && state.categories.length > 0
    ? state.categories.filter(c => !c.hidden)
    : [];

  categories.forEach((cat) => {
    const catTasks = state.tasks.filter(t => t.category === cat.id && !t.hidden);
    if (catTasks.length === 0) return;

    // Category Header (e.g. *🟢 سنتوں پر عمل*)
    lines.push(`*${cat.emoji} ${cat.urdu}*`);

    // Tasks under category
    catTasks.forEach((task) => {
      const status = task.completed ? '✅' : '❌';
      lines.push(`${task.emoji}${task.urduTitle} ${status}`);
    });

    // If salah, include Takbeer-e-Oola count
    if (cat.id === 'salah' && state.takbeerOola !== undefined) {
      lines.push(`🔸تکبیر اولی ${state.takbeerOola}/5`);
    }

    lines.push('');
  });

  // Sleep & Wake times
  lines.push('*🟤 سونے اور جاگنے کا وقت*');
  lines.push(`🟫 سونے کا وقت: ${state.sleepTime || '11:30 PM'}`);
  lines.push(`🟫 جاگنے کا وقت: ${state.wakeTime || '05:00 AM'}`);

  return lines.join('\n');
}

/**
 * Builds a direct WhatsApp click-to-chat URL
 */
export function buildWhatsAppLink(phone: string, text: string): string {
  // clean up phone digits
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(text);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

/**
 * Retrieves the full WhatsApp report for a past DayRecord.
 * 1. Checks if a pre-generated reportText snapshot exists.
 * 2. Or regenerates from the tasks snapshot if preserved.
 * 3. Falls back cleanly to summary stats for legacy day records.
 */
export function getReportForDayRecord(record: DayRecord, state: MaamulatState): string {
  if (record.reportText) {
    return record.reportText;
  }

  if (record.tasks && record.tasks.length > 0) {
    return generateWhatsAppReport({
      ...state,
      todayDate: record.date,
      goalDay: record.goalDay,
      goalMaxDays: record.goalMaxDays,
      takbeerOola: record.takbeerOola,
      sleepTime: record.sleepTime,
      wakeTime: record.wakeTime,
      tasks: record.tasks,
    });
  }

  // Fallback for legacy day records without full task snapshot
  const lines: string[] = [];
  lines.push(`*ہدف یوم:* ${record.goalDay || 1}/${record.goalMaxDays || 40}`);
  lines.push(`*تاریخ:* ${record.urduDate || record.date}`);
  lines.push('');
  lines.push(`*📊 تکمیل معمولات:* ${record.completedCount}/${record.totalCount}`);
  lines.push(`*🔸 تکبیر اولی:* ${record.takbeerOola}/5`);
  lines.push(`*✨ کمائے گئے حسنات:* +${record.hasanatEarned}`);
  lines.push('');
  lines.push('*🟤 سونے اور جاگنے کا وقت*');
  lines.push(`🟫 سونے کا وقت: ${record.sleepTime || '11:30 PM'}`);
  lines.push(`🟫 جاگنے کا وقت: ${record.wakeTime || '05:00 AM'}`);

  return lines.join('\n');
}
