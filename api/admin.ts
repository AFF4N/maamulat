import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getRedisEnv,
  runRedis,
  getSubscriptions,
  getStoredReminders,
  saveStoredReminders,
  updateStoredReminder,
  setDefaultReminder,
  addStoredReminder,
  deleteStoredReminder,
  resetStoredReminders
} from '../src/utils/redisUtils.js';
import { initVapid, dispatchWebPush } from '../src/utils/pushUtils.js';



export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  }

  // 1. PIN Security Validation
  const expectedPin = process.env.ADMIN_PIN;
  if (!expectedPin) {
    return res.status(500).json({
      error: 'Security Error: ADMIN_PIN is not configured. Please set ADMIN_PIN in your Vercel Project Settings to enable admin access.'
    });
  }

  const providedPin =
    (req.headers['x-admin-pin'] as string) ||
    (req.query.pin as string) ||
    (req.body && req.body.pin);

  if (!providedPin || String(providedPin).trim() !== String(expectedPin).trim()) {
    return res.status(401).json({
      error: 'Unauthorized. Invalid Admin PIN.'
    });
  }

  const { isConfigured: redisConfigured } = getRedisEnv();
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  const envStatus = {
    redisConfigured,
    vapidConfigured: Boolean(vapidPublicKey && vapidPrivateKey),
    cronSecretConfigured: Boolean(process.env.CRON_SECRET),
    customPinSet: Boolean(process.env.ADMIN_PIN)
  };

  // ----------------------------------------------------------------------
  // GET: Return diagnostic stats, subscriber count, logs, and reminder list
  // ----------------------------------------------------------------------
  if (req.method === 'GET') {
    let subscriberCount = 0;
    let subscribersSample: Array<{ endpoint: string; domain: string; platform: string }> = [];
    let lastCronLog = null;
    let lastBroadcastLog = null;
    let scheduleConfig = null;
    let remindersList: any[] = [];

    if (envStatus.redisConfigured) {
      try {
        const [rawSubs, cronLogStr, bcastLogStr, schedStr, storedReminders] = await Promise.all([
          getSubscriptions(),
          runRedis(['GET', 'maamulat_last_cron_log']),
          runRedis(['GET', 'maamulat_last_broadcast_log']),
          runRedis(['GET', 'maamulat_schedule_config']),
          getStoredReminders()
        ]);

        remindersList = storedReminders;
        subscriberCount = rawSubs.length;

        subscribersSample = rawSubs.slice(0, 50).map((subStr: string) => {
          try {
            const parsed = JSON.parse(subStr);
            const url = new URL(parsed.endpoint);
            let platform = 'Web Push Gateway';
            if (url.hostname.includes('fcm.googleapis.com')) platform = 'Google Chrome / Android';
            else if (url.hostname.includes('push.apple.com')) platform = 'Apple Safari / iOS';
            else if (url.hostname.includes('mozilla.com')) platform = 'Mozilla Firefox';
            else if (url.hostname.includes('windows.com') || url.hostname.includes('microsoft.com')) platform = 'Microsoft Edge';

            return {
              endpoint: parsed.endpoint.slice(0, 35) + '...',
              domain: url.hostname,
              platform
            };
          } catch {
            return { endpoint: 'Device subscription', domain: 'push-service', platform: 'Web Browser' };
          }
        });

        if (cronLogStr) try { lastCronLog = typeof cronLogStr === 'string' ? JSON.parse(cronLogStr) : cronLogStr; } catch {}
        if (bcastLogStr) try { lastBroadcastLog = typeof bcastLogStr === 'string' ? JSON.parse(bcastLogStr) : bcastLogStr; } catch {}
        if (schedStr) try { scheduleConfig = typeof schedStr === 'string' ? JSON.parse(schedStr) : schedStr; } catch {}

        return res.status(200).json({
          success: true,
          env: envStatus,
          subscriberCount,
          subscribersSample,
          isUsingCustomReminders: true,
          reminders: remindersList,
          lastCronLog,
          lastBroadcastLog,
          scheduleConfig: scheduleConfig || {
            timePkt: '9:00 PM',
            cronExpression: '0 16 * * *',
            enabled: true,
            description: 'Daily automated evening reminder'
          }
        });
      } catch (err: any) {
        console.error('Failed reading admin state from Redis:', err);
      }
    }

    return res.status(200).json({
      success: true,
      env: envStatus,
      subscriberCount: 0,
      subscribersSample: [],
      isUsingCustomReminders: true,
      reminders: remindersList,
      lastCronLog: null,
      lastBroadcastLog: null,
      scheduleConfig: {
        timePkt: '9:00 PM',
        cronExpression: '0 16 * * *',
        enabled: true,
        description: 'Daily automated evening reminder'
      }
    });
  }

  // ----------------------------------------------------------------------
  // POST: Execute Actions
  // ----------------------------------------------------------------------
  const { action, title, body, url, reminders, reminder, id, index, schedule } = req.body || {};

  if (!envStatus.redisConfigured) {
    return res.status(500).json({
      error: 'Redis is not configured in Vercel environment variables (KV_REST_API_URL and KV_REST_API_TOKEN).'
    });
  }

  // Web Push setup for dispatch actions
  if (action === 'broadcast' || action === 'trigger-cron') {
    const vapid = initVapid();
    if (!vapid.configured) {
      return res.status(500).json({ error: vapid.error });
    }
  }

  // 1. Worldwide Instant Broadcast
  if (action === 'broadcast') {
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required for broadcast.' });
    }

    const rawSubs = await getSubscriptions();
    if (rawSubs.length === 0) {
      return res.status(200).json({
        success: true,
        sentCount: 0,
        message: 'No subscribers registered yet.'
      });
    }

    const { sentCount, prunedCount, failedCount } = await dispatchWebPush(rawSubs, {
      title,
      body,
      url
    });

    const logData = {
      timestamp: new Date().toISOString(),
      title,
      body,
      sentCount,
      prunedCount,
      failedCount
    };
    await runRedis(['SET', 'maamulat_last_broadcast_log', JSON.stringify(logData)]);

    return res.status(200).json({
      success: true,
      message: `Broadcast delivered to ${sentCount} device(s).`,
      sentCount,
      prunedCount,
      failedCount
    });
  }

  // 2. Trigger Cron Reminder Immediately
  if (action === 'trigger-cron') {
    const rawSubs = await getSubscriptions();
    if (rawSubs.length === 0) {
      return res.status(200).json({
        success: true,
        sentCount: 0,
        message: 'No active subscribers found in database.'
      });
    }

    const activeReminders = await getStoredReminders();
    const reminderItem = activeReminders.find((r) => r.isDefault) || activeReminders[0];

    const { sentCount, prunedCount, failedCount } = await dispatchWebPush(rawSubs, reminderItem);

    const logData = {
      timestamp: new Date().toISOString(),
      reminder: reminderItem,
      sentCount,
      prunedCount,
      failedCount
    };
    await runRedis(['SET', 'maamulat_last_cron_log', JSON.stringify(logData)]);


    return res.status(200).json({
      success: true,
      message: `Triggered scheduled reminder to ${sentCount} device(s).`,
      reminder: reminderItem,
      sentCount,
      prunedCount,
      failedCount
    });
  }

  // 3. Save / Replace Entire Reminders List
  if (action === 'save-reminders') {
    if (!Array.isArray(reminders) || reminders.length === 0) {
      return res.status(400).json({ error: 'Reminders list must be a non-empty array.' });
    }
    const updated = await saveStoredReminders(reminders);
    return res.status(200).json({
      success: true,
      message: `Successfully saved ${updated.length} reminders to cloud.`,
      reminders: updated
    });
  }

  // 4. Update Single Reminder In-place
  if (action === 'update-reminder') {
    if (!reminder || (!reminder.id && index === undefined)) {
      return res.status(400).json({ error: 'Missing reminder data or id to update.' });
    }
    const updated = await updateStoredReminder(reminder, index);
    return res.status(200).json({
      success: true,
      message: 'Reminder updated successfully in cloud.',
      reminders: updated
    });
  }

  // 5. Set Reminder as Default
  if (action === 'set-default-reminder') {
    const target = id !== undefined ? id : index;
    if (target === undefined) {
      return res.status(400).json({ error: 'Target id or index required.' });
    }
    const updated = await setDefaultReminder(target);
    return res.status(200).json({
      success: true,
      message: 'Default reminder updated in cloud.',
      reminders: updated
    });
  }

  // 6. Add New Reminder
  if (action === 'add-reminder') {
    const itemToAdd = reminder || { title, body, url };
    if (!itemToAdd.title?.trim() || !itemToAdd.body?.trim()) {
      return res.status(400).json({ error: 'Title and body are required.' });
    }
    const updated = await addStoredReminder(itemToAdd);
    return res.status(200).json({
      success: true,
      message: 'New reminder added to cloud.',
      reminders: updated
    });
  }

  // 7. Delete Reminder
  if (action === 'delete-reminder') {
    const target = id !== undefined ? id : index;
    if (target === undefined) {
      return res.status(400).json({ error: 'Target id or index required.' });
    }
    try {
      const updated = await deleteStoredReminder(target);
      return res.status(200).json({
        success: true,
        message: 'Reminder deleted from cloud.',
        reminders: updated
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 8. Reset Reminders to Default Curated Collection
  if (action === 'reset-reminders') {
    const updated = await resetStoredReminders();
    return res.status(200).json({
      success: true,
      message: 'Reset back to default curated Islamic reminders.',
      reminders: updated
    });
  }

  // 9. Save Schedule Config
  if (action === 'save-schedule') {
    if (!schedule) {
      return res.status(400).json({ error: 'Missing schedule configuration.' });
    }
    await runRedis(['SET', 'maamulat_schedule_config', JSON.stringify(schedule)]);
    return res.status(200).json({
      success: true,
      message: 'Schedule configuration saved.'
    });
  }

  return res.status(400).json({ error: 'Invalid action provided.' });
}
