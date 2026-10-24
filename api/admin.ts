import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';

// Curated rotation of daily spiritual reminders, Hadiths, Quranic verses, and Duas
const DAILY_REMINDERS = [
  {
    title: 'معمولات | آج کا محاسبہ 🌙',
    body: 'سونے سے پہلے آج کے معمولات و تلاوت کا اندراج یاد سے کر لیں۔ (Don\'t forget your daily report)',
    url: '/?action=missing-reports'
  },
  {
    title: 'فرمانِ نبوی ﷺ | ہمیشگی کی فضیلت 💫',
    body: 'أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ — اللہ کو سب سے پسندیدہ عمل وہ ہے جو ہمیشگی سے کیا جائے اگرچہ کم ہو۔',
    url: '/?action=missing-reports'
  },
  {
    title: 'قرآنی تذکیر | ذکرِ الٰہی 📖',
    body: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ — سن لو! دلوں کو اطمینان اللہ ہی کے ذکر سے حاصل ہوتا ہے۔ معمولات چیک کریں۔',
    url: '/?action=missing-reports'
  },
  {
    title: 'مسنون دعا | شام کا ورد 🤲',
    body: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    url: '/?action=missing-reports'
  },
  {
    title: 'محاسبہ نفس | حضرت عمرؓ کا قول ⚖️',
    body: 'حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا — اپنا محاسبہ کرو اس سے پہلے کہ تمہارا حساب لیا جائے۔ معمولات درج فرمائیں۔',
    url: '/?action=missing-reports'
  },
  {
    title: 'درود شریف کی فضیلت 🌹',
    body: 'مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا — آج درود شریف اور اذکار کا ہدف مکمل کیجیے۔',
    url: '/?action=missing-reports'
  },
  {
    title: 'سید الاستغفار 🤲✨',
    body: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ — سونے سے قبل استغفار اور توبہ کا اہتمام فرمائیں۔',
    url: '/?action=missing-reports'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  }

  // 1. PIN Security Validation (Strict: No hardcoded fallback)
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

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidMailto = process.env.VAPID_MAILTO;

  const envStatus = {
    redisConfigured: Boolean(redisUrl && redisToken),
    vapidConfigured: Boolean(vapidPublicKey && vapidPrivateKey),
    cronSecretConfigured: Boolean(process.env.CRON_SECRET),
    customPinSet: Boolean(process.env.ADMIN_PIN)
  };

  // Helper to execute Upstash Redis REST command
  const runRedis = async (command: string[]) => {
    if (!redisUrl || !redisToken) return null;
    try {
      const response = await fetch(redisUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(command)
      });
      const data = await response.json();
      return data.result;
    } catch (e) {
      console.error('Redis execution error:', e);
      return null;
    }
  };

  // ----------------------------------------------------------------------
  // GET: Return diagnostic stats, subscriber count, logs, and reminder list
  // ----------------------------------------------------------------------
  if (req.method === 'GET') {
    let subscriberCount = 0;
    let subscribersSample: Array<{ endpoint: string; domain: string }> = [];
    let customReminders = null;
    let lastCronLog = null;
    let lastBroadcastLog = null;
    let scheduleConfig = null;

    if (envStatus.redisConfigured) {
      try {
        // 1. Fetch subscribers
        const rawSubs = (await runRedis(['SMEMBERS', 'maamulat_push_subscriptions'])) || [];
        subscriberCount = Array.isArray(rawSubs) ? rawSubs.length : 0;

        // Sample first 5 endpoints (masked for privacy)
        if (Array.isArray(rawSubs)) {
          subscribersSample = rawSubs.slice(0, 5).map((subStr: string) => {
            try {
              const parsed = JSON.parse(subStr);
              const url = new URL(parsed.endpoint);
              return {
                endpoint: parsed.endpoint.slice(0, 30) + '...',
                domain: url.hostname
              };
            } catch {
              return { endpoint: 'Device subscription', domain: 'push-service' };
            }
          });
        }

        // 2. Fetch logs and custom reminders
        const [customRemStr, cronLogStr, bcastLogStr, schedStr] = await Promise.all([
          runRedis(['GET', 'maamulat_custom_reminders']),
          runRedis(['GET', 'maamulat_last_cron_log']),
          runRedis(['GET', 'maamulat_last_broadcast_log']),
          runRedis(['GET', 'maamulat_schedule_config'])
        ]);

        if (customRemStr) {
          try {
            customReminders = typeof customRemStr === 'string' ? JSON.parse(customRemStr) : customRemStr;
          } catch {}
        }

        if (cronLogStr) {
          try {
            lastCronLog = typeof cronLogStr === 'string' ? JSON.parse(cronLogStr) : cronLogStr;
          } catch {}
        }

        if (bcastLogStr) {
          try {
            lastBroadcastLog = typeof bcastLogStr === 'string' ? JSON.parse(bcastLogStr) : bcastLogStr;
          } catch {}
        }

        if (schedStr) {
          try {
            scheduleConfig = typeof schedStr === 'string' ? JSON.parse(schedStr) : schedStr;
          } catch {}
        }
      } catch (err: any) {
        console.error('Failed reading admin state from Redis:', err);
      }
    }

    return res.status(200).json({
      success: true,
      env: envStatus,
      subscriberCount,
      subscribersSample,
      isUsingCustomReminders: Boolean(customReminders && customReminders.length > 0),
      reminders: customReminders && customReminders.length > 0 ? customReminders : DAILY_REMINDERS,
      lastCronLog,
      lastBroadcastLog,
      scheduleConfig: scheduleConfig || {
        timePkt: '9:00 PM',
        cronExpression: '0 16 * * *',
        enabled: true,
        description: 'Daily automated evening reminder'
      }
    });
  }

  // ----------------------------------------------------------------------
  // POST: Execute Actions (Broadcast, Trigger Cron, Save Reminders, Save Schedule)
  // ----------------------------------------------------------------------
  const { action, title, body, url, reminders, schedule } = req.body || {};

  if (!envStatus.redisConfigured) {
    return res.status(500).json({
      error: 'Upstash Redis is not configured in Vercel environment variables (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN).'
    });
  }

  // Setup Web Push
  if (action === 'broadcast' || action === 'trigger-cron') {
    if (!vapidPublicKey || !vapidPrivateKey || !vapidMailto) {
      return res.status(500).json({
        error: 'VAPID keys or VAPID_MAILTO are missing in Vercel environment variables (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_MAILTO).'
      });
    }

    try {
      webpush.setVapidDetails(vapidMailto, vapidPublicKey, vapidPrivateKey);
    } catch (e: any) {
      return res.status(500).json({ error: `VAPID configuration error: ${e?.message || e}` });
    }
  }

  // 1. Broadcast custom notification worldwide
  if (action === 'broadcast') {
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required for broadcast.' });
    }

    const rawSubs: string[] = (await runRedis(['SMEMBERS', 'maamulat_push_subscriptions'])) || [];

    if (!rawSubs || rawSubs.length === 0) {
      return res.status(200).json({
        success: true,
        sentCount: 0,
        message: 'No active subscribed devices found in Redis database.'
      });
    }

    const payload = JSON.stringify({
      title: title.trim(),
      body: body.trim(),
      url: url || '/?action=missing-reports',
      icon: '/icon.svg',
      badge: '/icon.svg'
    });

    let sentCount = 0;
    let prunedCount = 0;
    let failedCount = 0;

    await Promise.all(
      rawSubs.map(async (subStr) => {
        try {
          const sub = JSON.parse(subStr);
          await webpush.sendNotification(sub, payload);
          sentCount++;
        } catch (err: any) {
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await runRedis(['SREM', 'maamulat_push_subscriptions', subStr]);
            prunedCount++;
          } else {
            failedCount++;
          }
        }
      })
    );

    // Save broadcast log
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
    const rawSubs: string[] = (await runRedis(['SMEMBERS', 'maamulat_push_subscriptions'])) || [];

    if (!rawSubs || rawSubs.length === 0) {
      return res.status(200).json({
        success: true,
        sentCount: 0,
        message: 'No active subscribers found in database.'
      });
    }

    // Determine reminder
    let activeReminders = DAILY_REMINDERS;
    const customRemStr = await runRedis(['GET', 'maamulat_custom_reminders']);
    if (customRemStr) {
      try {
        const parsed = typeof customRemStr === 'string' ? JSON.parse(customRemStr) : customRemStr;
        if (Array.isArray(parsed) && parsed.length > 0) activeReminders = parsed;
      } catch {}
    }

    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const reminder = activeReminders[dayOfYear % activeReminders.length];

    const payload = JSON.stringify({
      title: reminder.title,
      body: reminder.body,
      url: reminder.url || '/?action=missing-reports',
      icon: '/icon.svg',
      badge: '/icon.svg'
    });

    let sentCount = 0;
    let prunedCount = 0;
    let failedCount = 0;

    await Promise.all(
      rawSubs.map(async (subStr) => {
        try {
          const sub = JSON.parse(subStr);
          await webpush.sendNotification(sub, payload);
          sentCount++;
        } catch (err: any) {
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await runRedis(['SREM', 'maamulat_push_subscriptions', subStr]);
            prunedCount++;
          } else {
            failedCount++;
          }
        }
      })
    );

    // Save cron log
    const logData = {
      timestamp: new Date().toISOString(),
      reminder,
      sentCount,
      prunedCount,
      failedCount
    };
    await runRedis(['SET', 'maamulat_last_cron_log', JSON.stringify(logData)]);

    return res.status(200).json({
      success: true,
      message: `Triggered scheduled reminder to ${sentCount} device(s).`,
      reminder,
      sentCount,
      prunedCount,
      failedCount
    });
  }

  // 3. Save Custom Reminders List
  if (action === 'save-reminders') {
    if (!Array.isArray(reminders) || reminders.length === 0) {
      return res.status(400).json({ error: 'Reminders list must be a non-empty array.' });
    }

    await runRedis(['SET', 'maamulat_custom_reminders', JSON.stringify(reminders)]);
    return res.status(200).json({
      success: true,
      message: `Successfully saved ${reminders.length} reminders to cloud.`
    });
  }

  // 4. Reset Reminders to Default
  if (action === 'reset-reminders') {
    await runRedis(['DEL', 'maamulat_custom_reminders']);
    return res.status(200).json({
      success: true,
      message: 'Reset back to default curated Islamic reminders.'
    });
  }

  // 5. Save Schedule Config
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
