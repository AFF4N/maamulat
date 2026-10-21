import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Serverless function to manage Web Push subscriptions
 * Stored in Upstash Redis REST API (Free 10,000 commands/day)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { action, subscription, endpoint } = req.body || {};

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      // Diagnostic message when env vars are pending in Vercel Dashboard
      return res.status(200).json({
        success: true,
        notice: 'Subscription acknowledged. To persist across all cron runs, connect Upstash Redis in your Vercel project settings.'
      });
    }

    if (action === 'unsubscribe' && endpoint) {
      // Fetch all to find the matching endpoint and remove
      const listRes = await fetch(`${redisUrl}/smembers/maamulat_push_subscriptions`, {
        headers: { Authorization: `Bearer ${redisToken}` }
      });
      const data = await listRes.json();
      const allSubs: string[] = data.result || [];

      for (const item of allSubs) {
        try {
          const parsed = JSON.parse(item);
          if (parsed.endpoint === endpoint) {
            await fetch(`${redisUrl}/srem/maamulat_push_subscriptions/${encodeURIComponent(item)}`, {
              headers: { Authorization: `Bearer ${redisToken}` }
            });
          }
        } catch {}
      }

      return res.status(200).json({ success: true, message: 'Unsubscribed successfully.' });
    }

    if (action === 'subscribe' && subscription?.endpoint) {
      const subString = JSON.stringify(subscription);
      await fetch(`${redisUrl}/sadd/maamulat_push_subscriptions/${encodeURIComponent(subString)}`, {
        headers: { Authorization: `Bearer ${redisToken}` }
      });

      return res.status(200).json({ success: true, message: 'Subscribed successfully.' });
    }

    return res.status(400).json({ error: 'Invalid request payload.' });
  } catch (error: any) {
    console.error('Error handling subscription:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
