import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedisEnv, runRedis, getSubscriptions, getStoredReminders } from '../src/utils/redisUtils.js';
import { initVapid, dispatchWebPush } from '../src/utils/pushUtils.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Verify VAPID server configuration
  const vapid = initVapid();
  if (!vapid.configured) {
    return res.status(500).json({ error: vapid.error });
  }

  // 2. Optional security: verify cron secret if configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized cron trigger' });
    }
  }

  const { isConfigured: redisConfigured } = getRedisEnv();
  if (!redisConfigured) {
    return res.status(500).json({
      error: 'Missing Redis configuration. Set KV_REST_API_URL and KV_REST_API_TOKEN in Vercel.'
    });
  }

  try {
    // 3. Fetch all subscriptions from Upstash Redis Set
    const rawSubs = await getSubscriptions();
    if (!rawSubs || rawSubs.length === 0) {
      return res.status(200).json({
        success: true,
        sentCount: 0,
        message: 'No active push subscriptions found.'
      });
    }

    // 4. Retrieve cloud-managed reminders and select default
    const activeReminders = await getStoredReminders();
    const reminder = activeReminders.find((r) => r.isDefault) || activeReminders[0];

    // 5. Dispatch web push to all active devices
    const { sentCount, prunedCount, failedCount } = await dispatchWebPush(rawSubs, reminder);

    // 6. Log cron run in Redis for Admin Dashboard
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
