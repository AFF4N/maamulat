import webpush from 'web-push';
import { removeSubscription } from './redisUtils.js';

export interface PushResult {
  sentCount: number;
  prunedCount: number;
  failedCount: number;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
}

/**
 * Configure VAPID details for Web Push
 */
export function initVapid(): { configured: boolean; error?: string } {
  const env =
    typeof globalThis !== 'undefined' && (globalThis as any).process?.env
      ? (globalThis as any).process.env
      : {};
  const vapidPublicKey = env.VAPID_PUBLIC_KEY || env.VITE_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = env.VAPID_PRIVATE_KEY;
  const vapidMailto = env.VAPID_MAILTO || 'mailto:admin@maamulat.app';

  if (!vapidPublicKey || !vapidPrivateKey) {
    return {
      configured: false,
      error: 'VAPID cryptographic keys are missing in Vercel environment variables.'
    };
  }

  try {
    webpush.setVapidDetails(vapidMailto, vapidPublicKey, vapidPrivateKey);
    return { configured: true };
  } catch (e: any) {
    return { configured: false, error: `VAPID configuration error: ${e?.message || e}` };
  }
}

/**
 * Dispatches web push notification to an array of subscription strings
 * and automatically prunes expired endpoints (HTTP 404/410)
 */
export async function dispatchWebPush(
  subscriptions: string[],
  payloadData: PushNotificationPayload
): Promise<PushResult> {
  const payload = JSON.stringify({
    title: payloadData.title,
    body: payloadData.body,
    url: payloadData.url || '/?action=missing-reports',
    icon: payloadData.icon || '/icon.svg',
    badge: payloadData.badge || '/icon.svg'
  });

  let sentCount = 0;
  let prunedCount = 0;
  let failedCount = 0;

  await Promise.all(
    subscriptions.map(async (subStr) => {
      try {
        const sub = JSON.parse(subStr);
        await webpush.sendNotification(sub, payload);
        sentCount++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await removeSubscription(subStr);
          prunedCount++;
        } else {
          failedCount++;
        }
      }
    })
  );

  return { sentCount, prunedCount, failedCount };
}
