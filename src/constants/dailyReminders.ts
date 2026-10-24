export interface DefaultReminder {
  id: string;
  title: string;
  body: string;
  url: string;
  isDefault?: boolean;
}

// Curated rotation of daily spiritual reminders, Hadiths, Quranic verses, and Duas
export const DAILY_REMINDERS: DefaultReminder[] = [
  {
    id: 'rem_1',
    title: 'معمولات | آج کا محاسبہ 🌙',
    body: "سونے سے پہلے آج کے معمولات و تلاوت کا اندراج یاد سے کر لیں۔ (Don't forget your daily report)",
    url: '/?action=missing-reports',
    isDefault: true
  },
  {
    id: 'rem_2',
    title: 'فرمانِ نبوی ﷺ | ہمیشگی کی فضیلت 💫',
    body: 'أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ — اللہ کو سب سے پسندیدہ عمل وہ ہے جو ہمیشگی سے کیا جائے اگرچہ کم ہو۔',
    url: '/?action=missing-reports'
  },
  {
    id: 'rem_3',
    title: 'قرآنی تذکیر | ذکرِ الٰہی 📖',
    body: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ — سن لو! دلوں کو اطمینان اللہ ہی کے ذکر سے حاصل ہوتا ہے۔ معمولات چیک کریں۔',
    url: '/?action=missing-reports'
  },
  {
    id: 'rem_4',
    title: 'مسنون دعا | شام کا ورد 🤲',
    body: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    url: '/?action=missing-reports'
  },
  {
    id: 'rem_5',
    title: 'محاسبہ نفس | حضرت عمرؓ کا قول ⚖️',
    body: 'حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا — اپنا محاسبہ کرو اس سے پہلے کہ تمہارا حساب لیا جائے۔ معمولات درج فرمائیں۔',
    url: '/?action=missing-reports'
  },
  {
    id: 'rem_6',
    title: 'درود شریف کی فضیلت 🌹',
    body: 'مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا — آج درود شریف اور اذکار کا ہدف مکمل کیجیے۔',
    url: '/?action=missing-reports'
  },
  {
    id: 'rem_7',
    title: 'سید الاستغفار 🤲✨',
    body: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ — سونے سے قبل استغفار اور توبہ کا اہتمام فرمائیں۔',
    url: '/?action=missing-reports'
  }
];
