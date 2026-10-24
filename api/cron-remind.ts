import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';

// Curated rotation of daily spiritual reminders, Hadiths, Quranic verses, and Duas
export const DAILY_REMINDERS = [
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
  // 1. Verify VAPID server configuration
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidMailto = process.env.VAPID_MAILTO || 'mailto:admin@maamulat.app';

  if (!vapidPublicKey || !vapidPrivateKey) {
    return res.status(500).json({
      error: 'Missing VAPID configuration. Please set VAPID_PRIVATE_KEY and VAPID_PUBLIC_KEY in Vercel.'
    });
  }

  try {
    webpush.setVapidDetails(vapidMailto, vapidPublicKey, vapidPrivateKey);
  } catch (e: any) {
    return res.status(500).json({ error: `VAPID configuration error: ${e?.message || e}` });
  }

  // 2. Optional security: verify cron secret if configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized cron trigger' });
    }
  }

  const redisUrl = process.env.KV_REST_API_URL;
  const redisToken = process.env.KV_REST_API_TOKEN;

  if (!redisUrl || !redisToken) {
    return res.status(500).json({
      error: 'Missing Redis configuration. Set KV_REST_API_URL and KV_REST_API_TOKEN in Vercel.'
    });
  }

  try {
    // 3. Fetch all subscriptions from Upstash Redis Set
    const listRes = await fetch(`${redisUrl}/smembers/maamulat_push_subscriptions`, {
      headers: { Authorization: `Bearer ${redisToken}` }
    });
    const data = await listRes.json();
    const rawSubs: string[] = data.result || [];

    if (!rawSubs || rawSubs.length === 0) {
      return res.status(200).json({
        success: true,
        sentCount: 0,
        message: 'No active push subscriptions found.'
      });
    }

    // 4. Determine reminders list (check if admin configured custom reminders in Redis)
    let activeReminders = DAILY_REMINDERS;
    try {
      const customRes = await fetch(`${redisUrl}/get/maamulat_custom_reminders`, {
        headers: { Authorization: `Bearer ${redisToken}` }
      });
      const customJson = await customRes.json();
      if (customJson?.result) {
        const parsed = typeof customJson.result === 'string' ? JSON.parse(customJson.result) : customJson.result;
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeReminders = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load custom reminders, using defaults:', e);
    }

    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const reminder = activeReminders[dayOfYear % activeReminders.length];

    const payload = JSON.stringify({
      title: reminder.title,
      body: reminder.body,
      url: reminder.url,
      icon: '/icon.svg',
      badge: '/icon.svg'
    });

    let sentCount = 0;
    let prunedCount = 0;
    let failedCount = 0;

    // 5. Dispatch web push to all active devices
    await Promise.all(
      rawSubs.map(async (subStr) => {
        try {
          const sub = JSON.parse(subStr);
          await webpush.sendNotification(sub, payload);
          sentCount++;
        } catch (err: any) {
          // If expired (404/410), prune from Redis automatically
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            try {
              await fetch(`${redisUrl}/srem/maamulat_push_subscriptions/${encodeURIComponent(subStr)}`, {
                headers: { Authorization: `Bearer ${redisToken}` }
              });
              prunedCount++;
            } catch {}
          } else {
            failedCount++;
          }
        }
      })
    );

    // 6. Log cron run in Redis for Admin Dashboard
    try {
      const logData = JSON.stringify({
        timestamp: new Date().toISOString(),
        reminder,
        sentCount,
        prunedCount,
        failedCount
      });
      await fetch(redisUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['SET', 'maamulat_last_cron_log', logData])
      });
    } catch {}

    return res.status(200).json({
      success: true,
      sentCount,
      prunedCount,
      failedCount,
      reminder
    });
  } catch (error: any) {
    console.error('Error executing cron push:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
