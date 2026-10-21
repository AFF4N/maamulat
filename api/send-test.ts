import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidMailto = process.env.VAPID_MAILTO || 'mailto:support@maamulat.app';

  if (!vapidPublicKey || !vapidPrivateKey) {
    return res.status(500).json({
      error: 'VAPID keys not configured in server environment. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Vercel.'
    });
  }

  try {
    webpush.setVapidDetails(vapidMailto, vapidPublicKey, vapidPrivateKey);
  } catch (e: any) {
    return res.status(500).json({ error: `VAPID setup error: ${e?.message || e}` });
  }

  try {
    const { subscription, title, body } = req.body || {};

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Missing push subscription object.' });
    }

    const payload = JSON.stringify({
      title: title || 'معمولات | تجرباتی یاد دہانی 🌙',
      body: body || 'نوٹیفیکیشنز کامیابی سے فعال ہیں! روزانہ شام کو آپ کو معمولات کی یاد دہانی موصول ہوگی۔',
      url: '/?action=missing-reports',
      icon: '/icon.svg',
      badge: '/icon.svg'
    });

    await webpush.sendNotification(subscription, payload);

    return res.status(200).json({ success: true, message: 'Test notification delivered.' });
  } catch (error: any) {
    console.error('Error sending test push:', error);
    return res.status(500).json({
      error: error.message || 'Failed to deliver test notification',
      statusCode: error.statusCode
    });
  }
}
