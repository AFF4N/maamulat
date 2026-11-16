export type TaskCategory = 
  | 'salah' 
  | 'sunnah' 
  | 'quran' 
  | 'dhikr_morning' 
  | 'dhikr_evening' 
  | 'nawafil' 
  | 'duas' 
  | 'hifazat'
  | (string & {});

export interface CategoryConfig {
  id: string;
  urdu: string;
  english: string;
  emoji: string;
  accent?: string;
  hidden?: boolean;
}

export interface MaamulatTask {
  id: string;
  category: string;
  urduTitle: string;
  englishTitle: string;
  description?: string;
  infoTooltip?: string;       // (i) guidance explanation tooltip
  linkUrl?: string;           // Optional external resource (e.g. PDF download)
  linkLabel?: string;         // Label for link
  customMeasure?: string;     // Customizable measure (e.g. Tilawat portion)
  emoji: string;
  hasanat: number;
  baseHasanat?: number;       // Optional per-repetition Hasanat for countable tasks (e.g. Dhikr)
  targetCount?: number;       // Repetition count for countable tasks (e.g. 100, 150)
  completed: boolean;
  completedAt?: string;
  hidden?: boolean;           // Allows hiding tasks from daily sheet
  excludeFromReport?: boolean; // Keeps task active on daily sheet, omits from WhatsApp report
}

export interface DayRecord {
  date: string;               // YYYY-MM-DD
  urduDate: string;           // e.g. "03 اکتوبر 2026"
  hijriDate?: string;         // e.g. "10 Jumada I 1448 AH (10 جمادی الاول، 1448 ھ)"
  goalDay: number;            // e.g. 7
  goalMaxDays: number;        // e.g. 40
  completedCount: number;
  totalCount: number;
  hasanatEarned: number;
  takbeerOola: number;        // 0 to 5
  sleepTime: string;          // e.g. "11:30 PM"
  wakeTime: string;           // e.g. "05:00 AM"
  status: 'completed' | 'partial' | 'missed';
  reportText?: string;        // Full WhatsApp formatted text report
  tasks?: MaamulatTask[];     // Task snapshot for that day
}

export interface MaamulatState {
  version: number;
  todayDate: string;          // YYYY-MM-DD
  goalDay: number;            // 1 to goalMaxDays
  goalMaxDays: number;        // user customizable: 7, 21, 40, 100, etc.
  syncGoalWithStreak?: boolean; // when true (default), breaking streak resets goalDay to 1
  hijriAdjustment?: number;   // -3 to +3 days manual offset based on local moon sighting
  streak: {
    current: number;
    highest: number;
    lastActiveDate: string;
  };
  totalHasanat: number;
  takbeerOola: number;        // 0 to 5
  sleepTime: string;          // e.g. "11:30 PM"
  wakeTime: string;           // e.g. "05:00 AM"
  categories: CategoryConfig[]; // customizable sections
  tasks: MaamulatTask[];
  history: DayRecord[];
  murrabiContact?: string;    // from ?murrabi= or stored
  // TODO(legacy-migration): Remove chillaDay/chillaMaxDays once all users have migrated to goalDay/goalMaxDays.
  chillaDay?: number;
  chillaMaxDays?: number;
}

export interface EncouragementQuote {
  quote: string;
  type: 'gentle' | 'humor' | 'spiritual' | 'reflection';
}
