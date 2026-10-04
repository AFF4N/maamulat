export type TaskCategory = 
  | 'salah' 
  | 'sunnah' 
  | 'quran' 
  | 'dhikr_morning' 
  | 'dhikr_evening' 
  | 'nawafil' 
  | 'duas'
  | 'hifazat';

export interface MaamulatTask {
  id: string;
  category: TaskCategory;
  urduTitle: string;
  englishTitle: string;
  description?: string;
  infoTooltip?: string;       // (i) guidance explanation tooltip
  linkUrl?: string;           // Optional external resource (e.g. PDF download)
  linkLabel?: string;         // Label for link
  customMeasure?: string;     // Customizable measure (e.g. Tilawat portion)
  emoji: string;
  hasanat: number;
  completed: boolean;
  completedAt?: string;
}

export interface DayRecord {
  date: string;               // YYYY-MM-DD
  urduDate: string;           // e.g. "03 اکتوبر 2026"
  goalDay: number;            // e.g. 7
  goalMaxDays: number;        // e.g. 40
  completedCount: number;
  totalCount: number;
  hasanatEarned: number;
  takbeerOola: number;        // 0 to 5
  sleepTime: string;          // e.g. "11:30 PM"
  wakeTime: string;           // e.g. "05:00 AM"
  status: 'completed' | 'partial' | 'missed';
}

export interface MaamulatState {
  version: number;
  todayDate: string;          // YYYY-MM-DD
  goalDay: number;            // 1 to goalMaxDays
  goalMaxDays: number;        // user customizable: 7, 21, 40, 100, etc.
  streak: {
    current: number;
    highest: number;
    lastActiveDate: string;
  };
  totalHasanat: number;
  takbeerOola: number;        // 0 to 5
  sleepTime: string;          // e.g. "11:30 PM"
  wakeTime: string;           // e.g. "05:00 AM"
  tasks: MaamulatTask[];
  history: DayRecord[];
  murrabiContact?: string;    // from ?murrabi= or stored
  chillaDay?: number;
  chillaMaxDays?: number;
}

export interface EncouragementQuote {
  quote: string;
  type: 'gentle' | 'humor' | 'spiritual' | 'reflection';
}
