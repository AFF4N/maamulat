export type AdminModule = 'notifications' | 'storage' | 'system';

export interface ReminderItem {
  title: string;
  body: string;
  url?: string;
  isDefault?: boolean;
}

export interface SubscriberDevice {
  endpoint: string;
  domain: string;
  platform?: string;
}

export interface AdminState {
  env: {
    redisConfigured: boolean;
    vapidConfigured: boolean;
    cronSecretConfigured: boolean;
    customPinSet: boolean;
  };
  subscriberCount: number;
  subscribersSample: SubscriberDevice[];
  isUsingCustomReminders: boolean;
  reminders: ReminderItem[];
  lastCronLog: {
    timestamp: string;
    reminder?: ReminderItem;
    sentCount: number;
    prunedCount: number;
    failedCount: number;
  } | null;
  lastBroadcastLog: {
    timestamp: string;
    title: string;
    body: string;
    sentCount: number;
    prunedCount: number;
    failedCount: number;
  } | null;
  scheduleConfig: {
    timePkt: string;
    cronExpression: string;
    enabled: boolean;
    description?: string;
  };
}
