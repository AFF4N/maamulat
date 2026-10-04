import type { MaamulatTask, EncouragementQuote } from '../types';

export const DEFAULT_TASKS: MaamulatTask[] = [
  // 🕌 نماز باجماعت (Salah in Congregation)
  {
    id: 'fajr_jamaat',
    category: 'salah',
    urduTitle: 'فجر باجماعت',
    englishTitle: 'Fajr in Congregation',
    description: 'Starting the morning in the protection of Allah',
    emoji: '🔸',
    hasanat: 35,
    completed: false,
  },
  {
    id: 'zuhr_jamaat',
    category: 'salah',
    urduTitle: 'ظہر با جماعت',
    englishTitle: 'Zuhr in Congregation',
    description: 'Pause the day for midday devotion',
    emoji: '🔸',
    hasanat: 30,
    completed: false,
  },
  {
    id: 'asr_jamaat',
    category: 'salah',
    urduTitle: 'عصر باجماعت',
    englishTitle: 'Asr in Congregation',
    description: 'The middle prayer of paramount virtue',
    emoji: '🔸',
    hasanat: 35,
    completed: false,
  },
  {
    id: 'maghrib_jamaat',
    category: 'salah',
    urduTitle: 'مغرب باجماعت',
    englishTitle: 'Maghrib in Congregation',
    description: 'Welcoming the night with gratitude',
    emoji: '🔸',
    hasanat: 30,
    completed: false,
  },
  {
    id: 'isha_jamaat',
    category: 'salah',
    urduTitle: 'عشاء باجماعت',
    englishTitle: 'Isha in Congregation',
    description: 'Concluding the active day in sacred assembly',
    emoji: '🔸',
    hasanat: 35,
    completed: false,
  },

  // 🟢 سنتوں پر عمل (Sunnah Practices)
  {
    id: 'miswak',
    category: 'sunnah',
    urduTitle: 'مسواک',
    englishTitle: 'Miswak',
    description: 'Sunnah of purification before Wudu and Salah',
    infoTooltip: 'طریقہ و آداب: دائیں ہاتھ کی چھوٹی انگلی اور انگوٹھا نیچے، بقیہ تین انگلیاں اوپر رکھ کر پکڑیں۔ دانتوں کے عرض (چوڑائی) میں ملیں، لمبائی میں نہیں، تا کہ مسوڑھے زخمی نہ ہوں۔ دانتوں کے اوپر نیچے، اندر باہر اور زبان پر نرمی سے ملیں۔\n\nاوقاتِ مسنونہ: وضو کے دوران (کلی کرتے وقت)، نماز سے قبل، قرآن مجید کی تلاوت سے پہلے، نیند سے بیداری پر اور گھر میں داخل ہوتے وقت۔\n\nفضیلت و ثواب: رسول اللہ ﷺ نے فرمایا: "مسواک منہ کی صفائی اور رب کی رضا کا ذریعہ ہے۔" (صحیح بخاری)\nاور فرمایا: "مسواک کر کے پڑھی جانے والی نماز، بغیر مسواک کی نماز سے ستر (70) گنا افضل ہے۔" (شعب الایمان، بیہقی)',
    emoji: '🔸',
    hasanat: 15,
    completed: false,
  },

  // 🔵 قرآن تلاوت (Qur'an Recitation)
  {
    id: 'surah_yaseen',
    category: 'quran',
    urduTitle: 'سورہ یاسین',
    englishTitle: 'Surah Yaseen',
    description: 'The heart of the Qur’an recited with reflection',
    emoji: '🔹',
    hasanat: 25,
    completed: false,
  },
  {
    id: 'surah_waqiah',
    category: 'quran',
    urduTitle: 'سورہ واقعہ',
    englishTitle: 'Surah Waqiah',
    description: 'Recitation of the inevitable reality & barakah',
    emoji: '🔹',
    hasanat: 25,
    completed: false,
  },
  {
    id: 'surah_mulk',
    category: 'quran',
    urduTitle: 'سورہ ملک',
    englishTitle: 'Surah Mulk',
    description: 'The protector and intercessor before night sleep',
    emoji: '🔹',
    hasanat: 25,
    completed: false,
  },
  {
    id: 'tilawat_paao',
    category: 'quran',
    urduTitle: 'تلاوت ( ایک پاؤ )',
    englishTitle: 'Tilawat (1 Paao / Quarter Juz)',
    customMeasure: 'ایک پاؤ',
    description: 'Daily portion with contemplation and slow recitation',
    emoji: '🔹',
    hasanat: 30,
    completed: false,
  },

  // 🔴 ذکر صبح (Morning Dhikr - 100x)
  {
    id: 'istighfar_morning',
    category: 'dhikr_morning',
    urduTitle: 'استغفار ۱۰۰',
    englishTitle: 'Astaghfirullah (100x)',
    description: 'Cleansing the slate at the dawn of the day',
    emoji: '🔺',
    hasanat: 20,
    completed: false,
  },
  {
    id: 'durood_morning',
    category: 'dhikr_morning',
    urduTitle: 'درود شریف ۱۰۰',
    englishTitle: 'Durood Sharif (100x)',
    description: 'Blessings upon the beloved Prophet Muhammad ﷺ',
    emoji: '🔺',
    hasanat: 20,
    completed: false,
  },
  {
    id: 'kalimah3_morning',
    category: 'dhikr_morning',
    urduTitle: 'تیسرا کلمہ ۱۰۰',
    englishTitle: '3rd Kalimah (100x)',
    description: 'Subhanallah, Walhamdulillah, Wala ilaha illallah...',
    emoji: '🔺',
    hasanat: 20,
    completed: false,
  },
  {
    id: 'kalimah1_morning',
    category: 'dhikr_morning',
    urduTitle: 'پہلا کلمہ ۱۰۰',
    englishTitle: '1st Kalimah (100x)',
    description: 'La ilaha illallah Muhammadur Rasulullah',
    emoji: '🔺',
    hasanat: 20,
    completed: false,
  },

  // 🔴 ذکر شام (Evening Dhikr - 100x)
  {
    id: 'istighfar_evening',
    category: 'dhikr_evening',
    urduTitle: 'استغفار ۱۰۰',
    englishTitle: 'Astaghfirullah (100x)',
    description: 'Seeking pardon before the night envelops the sky',
    emoji: '🔺',
    hasanat: 20,
    completed: false,
  },
  {
    id: 'durood_evening',
    category: 'dhikr_evening',
    urduTitle: 'درود شریف ۱۰۰',
    englishTitle: 'Durood Sharif (100x)',
    description: 'Sending loving salutations upon the Prophet ﷺ',
    emoji: '🔺',
    hasanat: 20,
    completed: false,
  },
  {
    id: 'kalimah3_evening',
    category: 'dhikr_evening',
    urduTitle: 'تیسرا کلمہ ۱۰۰',
    englishTitle: '3rd Kalimah (100x)',
    description: 'Glorifying the Lord of the heavens and earth',
    emoji: '🔺',
    hasanat: 20,
    completed: false,
  },
  {
    id: 'kalimah1_evening',
    category: 'dhikr_evening',
    urduTitle: 'پہلا کلمہ ۱۰۰',
    englishTitle: '1st Kalimah (100x)',
    description: 'Renewing the affirmation of pure Tawhid',
    emoji: '🔺',
    hasanat: 20,
    completed: false,
  },

  // 🟢 نوافل (Nawafil Prayers)
  {
    id: 'tahajjud',
    category: 'nawafil',
    urduTitle: 'تہجد',
    englishTitle: 'Tahajjud',
    description: 'The secret intimate hour when whispers reach the throne',
    infoTooltip: 'طریقہ: عشاء کے بعد سو کر رات کے آخری تہائی حصے میں اٹھنا۔ کم از کم ۲ رکعت، زیادہ سے زیادہ ۸ یا ۱۲ رکعت، ۲، ۲ کر کے ادا کریں۔\n\nفضیلت و ثواب: فرضوں کے بعد سب سے افضل نماز ہے۔ اس وقت اللہ تعالیٰ آسمانِ دنیا پر نزولِ رحمت فرماتے ہیں اور پکارتے ہیں: "ہے کوئی مانگنے والا کہ میں اسے دوں، ہے کوئی بخشش طلب کرنے والا کہ میں اسے بخش دوں!"، دعا کی قبولیت کا خاص وقت ہے۔',
    emoji: '🟩',
    hasanat: 40,
    completed: false,
  },
  {
    id: 'ishraq',
    category: 'nawafil',
    urduTitle: 'اشراق',
    englishTitle: 'Ishraq',
    description: 'The reward of a complete Hajj and Umrah',
    infoTooltip: 'طریقہ: فجر کی نماز کے بعد اپنی جگہ ذکر، درود و تلاوت میں بیٹھے رہیں، جب سورج طلوع ہو کر تقریباً ۱۵ سے ۲۰ منٹ گزر جائیں (مکروہ وقت ختم ہو جائے) تو ۲ یا ۴ رکعت ادا کریں۔\n\nفضیلت و ثواب: رسول اللہ ﷺ نے فرمایا: جو شخص فجر باجماعت پڑھ کر طلوعِ آفتاب تک اللہ کے ذکر میں بیٹھا رہے پھر دو رکعت پڑھے، اسے ایک کامل حج اور عمرہ کا ثواب ملتا ہے۔ (جامع ترمذی)',
    emoji: '🟩',
    hasanat: 20,
    completed: false,
  },
  {
    id: 'chasht',
    category: 'nawafil',
    urduTitle: 'چاشت',
    englishTitle: 'Chasht',
    description: 'Charity for every joint in your body',
    infoTooltip: 'طریقہ: سورج کے خوب چڑھ جانے اور تپش محسوس ہونے پر (صبح ۹ بجے سے لے کر زوال سے پہلے تک)، ۲، ۴، ۸ یا ۱۲ رکعت ادا کریں۔\n\nفضیلت و ثواب: انسان کے بدن میں ۳۶۰ جوڑ ہیں اور ہر جوڑ پر روزانہ ایک صدقہ لازم ہے۔ چاشت کی دو رکعتیں تمام ۳۶۰ جوڑوں کی طرف سے شکرانہ اور صدقہ ادا کر دیتی ہیں۔ (صحیح مسلم)',
    emoji: '🟩',
    hasanat: 20,
    completed: false,
  },
  {
    id: 'awwabin',
    category: 'nawafil',
    urduTitle: 'اوابین',
    englishTitle: 'Awwabin',
    description: 'The prayer of those who frequently return to Allah',
    infoTooltip: 'طریقہ: مغرب کے فرض و سنتوں کے بعد ۶ رکعت (دو دو کر کے) ادا کی جاتی ہیں۔\n\nفضیلت و ثواب: یہ کثرت سے اللہ کی طرف رجوع کرنے والوں (اوابین) کی نماز ہے۔ حدیث پاک میں آتا ہے کہ جو مغرب کے بعد ۶ رکعت پڑھے اور درمیان میں کوئی بری بات نہ کرے، اسے بارہ سال کی نفلی عبادت کا ثواب ملتا ہے۔ (جامع ترمذی)',
    emoji: '🟩',
    hasanat: 20,
    completed: false,
  },

  // ⚫ دعائیں (Duas & Munajat)
  {
    id: 'dua_tahajjud',
    category: 'duas',
    urduTitle: 'تہجد کے بعد دعا',
    englishTitle: 'Dua after Tahajjud',
    description: 'Pouring out personal needs in deep humility',
    infoTooltip: 'طریقہ و فضیلت: تہجد کی نماز کے بعد سجدے یا ہاتھ اٹھا کر اپنے اور امت کے گناہوں کی معافی اور جائز حاجات مانگنا۔ یہ وہ وقت ہے جب ربِ ذوالجلال بندے کے سب سے زیادہ قریب ہوتا ہے۔',
    emoji: '◼️',
    hasanat: 15,
    completed: false,
  },
  {
    id: 'munajat_faqeer',
    category: 'duas',
    urduTitle: 'مناجاتِ فقیر',
    englishTitle: 'Munajat-e-Faqeer',
    description: 'Heartfelt soulful supplication of spiritual seekers',
    // infoTooltip: 'مناجاتِ فقیر: حضرت مولانا پیر ذوالفقار احمد نقشبندی مدظلہم کی پرتاثیر دعائیہ مناجات، دل کو اللہ کے خوف و محبت سے نرم کرنے اور توبہ کی رقت پیدا کرنے والی دعائیں۔',
    linkUrl: 'https://drive.google.com/file/d/1JycrcWVXCUerCS6OY5NcD8xG_e8Uk9AU/view?usp=sharing',
    linkLabel: 'Download File',
    emoji: '◼️',
    hasanat: 20,
    completed: false,
  },

  // 🛡️ حفاظتِ اعضاء (Guarding the Senses & Limbs)
  {
    id: 'zuban_hifazat',
    category: 'hifazat',
    urduTitle: 'زبان کی حفاظت',
    englishTitle: 'Guarding the Tongue',
    description: 'بُرا نہ بولیں — غیبت، جھوٹ اور بدکلامی سے اجتناب',
    infoTooltip: 'بُرا نہ بولیں: غیبت، جھوٹ، گالی گلوچ، طنز اور فضول گفتگو سے مکمل پرہیز کرنا۔ رسول اللہ ﷺ نے فرمایا: جو شخص مجھے اپنی زبان اور شرمگاہ کی حفاظت کی ضمانت دے، میں اسے جنت کی ضمانت دیتا ہوں۔',
    emoji: '🛡️',
    hasanat: 30,
    completed: false,
  },
  {
    id: 'nazaron_hifazat',
    category: 'hifazat',
    urduTitle: 'نظروں کی حفاظت',
    englishTitle: 'Guarding the Gaze',
    description: 'بُرا نہ دیکھیں — نا محرم اور گناہ کے مناظر سے پرہیز',
    infoTooltip: 'بُرا نہ دیکھیں: نامحرم، غیر اخلاقی مناظر اور سوشل میڈیا کی بے حیائی سے آنکھوں کو جھکانا۔ قرآن کریم: "مومن مردوں سے کہہ دو کہ اپنی نظریں نیچی رکھیں۔"',
    emoji: '🛡️',
    hasanat: 30,
    completed: false,
  },
  {
    id: 'kaanon_hifazat',
    category: 'hifazat',
    urduTitle: 'کانوں کی حفاظت',
    englishTitle: 'Guarding the Ears',
    description: 'بُرا نہ سنیں — غیبت اور لایعنی باتوں سے کنارہ کشی',
    infoTooltip: 'بُرا نہ سنیں: غیبت سننے سے پرہیز کرنا، گانے اور فحش و لایعنی باتوں کو سننے سے کانوں کی حفاظت کرنا۔ جو بات بولنا حرام ہے، اسے سننا بھی گناہ ہے۔',
    emoji: '🛡️',
    hasanat: 25,
    completed: false,
  },
];

export const CATEGORY_INFO: Record<string, { urdu: string; english: string; emoji: string; accent: string }> = {
  salah: {
    urdu: 'نماز پنجگانہ باجماعت',
    english: '5 Daily Prayers (Congregation)',
    emoji: '🕌',
    accent: 'border-sage-300 dark:border-sage-700/60 bg-sage-50/40 dark:bg-sage-900/10'
  },
  sunnah: {
    urdu: 'سنتوں پر عمل',
    english: 'Sunnah Practices',
    emoji: '🟢',
    accent: 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/10'
  },
  quran: {
    urdu: 'قرآن تلاوت',
    english: 'Qur\'an Recitation',
    emoji: '🔵',
    accent: 'border-sky-200 dark:border-sky-800/40 bg-sky-50/30 dark:bg-sky-950/10'
  },
  dhikr_morning: {
    urdu: 'ذکر صبح (۱۰۰ مرتبہ)',
    english: 'Morning Dhikr (100x)',
    emoji: '🔴',
    accent: 'border-amber-200 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-950/10'
  },
  dhikr_evening: {
    urdu: 'ذکر شام (۱۰۰ مرتبہ)',
    english: 'Evening Dhikr (100x)',
    emoji: '🔴',
    accent: 'border-orange-200 dark:border-orange-800/40 bg-orange-50/30 dark:bg-orange-950/10'
  },
  nawafil: {
    urdu: 'نوافل',
    english: 'Nawafil Prayers',
    emoji: '🟢',
    accent: 'border-teal-200 dark:border-teal-800/40 bg-teal-50/30 dark:bg-teal-950/10'
  },
  duas: {
    urdu: 'دعائیں و مناجات',
    english: 'Duas & Munajat',
    emoji: '⚫',
    accent: 'border-stone-200 dark:border-stone-800/40 bg-stone-50/30 dark:bg-stone-900/20'
  },
  hifazat: {
    urdu: 'حفاظتِ جوارح و اعضاء',
    english: 'Guarding Senses & Limbs',
    emoji: '🛡️',
    accent: 'border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/30 dark:bg-indigo-950/10'
  }
};

export const ENCOURAGEMENT_QUOTES: EncouragementQuote[] = [
  {
    quote: "Your streak is looking at you. Don't make it awkward.",
    type: "humor"
  },
  {
    quote: "Past you showed up. Future you will be eternally grateful.",
    type: "gentle"
  },
  {
    quote: "Small deed. Big intention. Sincerity outweighs mountains.",
    type: "spiritual"
  },
  {
    quote: "Look at you collecting hasanat quietly while the world rushes by.",
    type: "humor"
  },
  {
    quote: "One little deed right now. Don't overthink it.",
    type: "gentle"
  },
  {
    quote: "The beloved deeds to Allah are those that are consistent, even if small.",
    type: "spiritual"
  },
  {
    quote: "Your heart deserves the tranquility of this quiet moment.",
    type: "reflection"
  },
  {
    quote: "Consistency is not perfection. It is returning after every stumble.",
    type: "reflection"
  },
  {
    quote: "Every takbeer is a secret victory against the whispers of laziness.",
    type: "spiritual"
  }
];
