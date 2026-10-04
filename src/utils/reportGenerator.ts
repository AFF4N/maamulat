import type { MaamulatState } from '../types';
import { formatUrduDate } from './dateUtils';

/**
 * Generates the authentic WhatsApp formatted text report
 * matching the user's daily spiritual habit tracker.
 */
export function generateWhatsAppReport(state: MaamulatState): string {
  const getTaskStatus = (id: string): string => {
    const t = state.tasks.find(x => x.id === id);
    return t && t.completed ? '✅' : '❌';
  };

  const urduDate = formatUrduDate(state.todayDate);

  const lines: string[] = [];

  // Goal & Date Header (e.g. *ہدف یوم:* 7/40)
  const currentDay = state.goalDay ?? state.chillaDay ?? 1;
  const targetDays = state.goalMaxDays ?? state.chillaMaxDays ?? 40;
  lines.push(`*ہدف یوم:* ${currentDay}/${targetDays}`);
  lines.push(`*تاریخ:* ${urduDate}`);
  lines.push('');

  // 1. Salah in congregation
  lines.push(`🔸فجر باجماعت ${getTaskStatus('fajr_jamaat')}`);
  lines.push(`🔸ظہر با جماعت ${getTaskStatus('zuhr_jamaat')}`);
  lines.push(`🔸عصر باجماعت ${getTaskStatus('asr_jamaat')}`);
  lines.push(`🔸مغرب باجماعت ${getTaskStatus('maghrib_jamaat')}`);
  lines.push(`🔸 عشاء باجماعت ${getTaskStatus('isha_jamaat')}`);
  lines.push(`🔸تکبیر اولی ${state.takbeerOola}/5`);
  lines.push('');

  // 2. Sunnah
  lines.push('*🟢 سنتوں پر عمل*');
  lines.push(`🔸مسواک ${getTaskStatus('miswak')}`);
  lines.push('');

  // 3. Quran Tilawat
  lines.push('*🔵 قرآن تلاوت*');
  lines.push(`🔹سورہ یاسین ${getTaskStatus('surah_yaseen')}`);
  lines.push(`🔹سورہ واقعہ ${getTaskStatus('surah_waqiah')}`);
  const tilawatTask = state.tasks.find(t => t.id === 'tilawat_paao');
  const tilawatLabel = tilawatTask ? tilawatTask.urduTitle : 'تلاوت ( ایک پاؤ )';
  lines.push(`🔹${tilawatLabel} ${getTaskStatus('tilawat_paao')}`);
  lines.push('');

  // 4. Morning Dhikr
  lines.push('*🔴 ذکر صبح*');
  lines.push(`🔺 استغفار 100 ${getTaskStatus('istighfar_morning')}`);
  lines.push(`🔺درود شریف 100 ${getTaskStatus('durood_morning')}`);
  lines.push(`🔺تیسرا کلمہ 100 ${getTaskStatus('kalimah3_morning')}`);
  lines.push(`🔺پہلا کلمہ 100 ${getTaskStatus('kalimah1_morning')}`);
  lines.push('');

  // 5. Evening Dhikr
  lines.push('*🔴 ذکر شام*');
  lines.push(`🔺 استغفار 100 ${getTaskStatus('istighfar_evening')}`);
  lines.push(`🔺درود شریف 100 ${getTaskStatus('durood_evening')}`);
  lines.push(`🔺تیسرا کلمہ 100 ${getTaskStatus('kalimah3_evening')}`);
  lines.push(`🔺پہلا کلمہ 100 ${getTaskStatus('kalimah1_evening')}`);
  lines.push('');

  // 6. Nawafil
  lines.push('*🟢نوافل*');
  lines.push(`🟩 تہجد ${getTaskStatus('tahajjud')}`);
  lines.push(`🟩 اشراق ${getTaskStatus('ishraq')}`);
  lines.push(`🟩 چاشت ${getTaskStatus('chasht')}`);
  lines.push(`🟩 اوابین ${getTaskStatus('awwabin')}`);
  lines.push('');

  // 7. Duas
  lines.push('*⚫ دعائیں*');
  lines.push(`◼️تہجد کے بعد دعا ${getTaskStatus('dua_tahajjud')}`);
  lines.push(`◼️ مناجات فقیر ${getTaskStatus('munajat_faqeer')}`);
  lines.push('');

  // 8. Guarding Senses & Limbs
  lines.push('*🛡️ اعضاء کی حفاظت*');
  lines.push(`🔹زبان کی حفاظت ${getTaskStatus('zuban_hifazat')}`);
  lines.push(`🔹نظروں کی حفاظت ${getTaskStatus('nazaron_hifazat')}`);
  lines.push(`🔹کانوں کی حفاظت ${getTaskStatus('kaanon_hifazat')}`);
  lines.push('');

  // 8. Sleep & Wake times
  lines.push('*🟤 سونے اور جاگنے کا وقت*');
  lines.push(`🟫 سونے کا وقت: ${state.sleepTime || '11:30PM'}`);
  lines.push(`🟫 جاگنے کا وقت: ${state.wakeTime || '05:00AM'}`);

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
