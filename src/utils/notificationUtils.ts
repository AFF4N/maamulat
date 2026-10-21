/**
 * Utility to manage Web Push Notifications and Service Worker subscriptions
 */

// Reads the public VAPID key injected by Vercel / Vite environment
export const VAPID_PUBLIC_KEY =
  ((import.meta as any).env?.VITE_VAPID_PUBLIC_KEY as string | undefined) || '';

export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Converts a base64 URL-safe string to a Uint8Array for PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Requests notification permission, registers push subscription with browser push service,
 * and syncs with the serverless /api/subscribe endpoint.
 */
export async function subscribeToPushNotifications(): Promise<{
  success: boolean;
  error?: string;
  subscription?: PushSubscription;
}> {
  if (!isPushNotificationSupported()) {
    return { success: false, error: 'Push notifications are not supported in this browser.' };
  }

  if (!VAPID_PUBLIC_KEY) {
    return {
      success: false,
      error: 'VAPID public key is not configured. Please set VITE_VAPID_PUBLIC_KEY in Vercel environment variables.'
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission was denied.' };
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any
      });
    }

    // Send subscription to serverless API
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          subscription: subscription.toJSON()
        })
      });
    } catch (e) {
      console.warn('Failed syncing subscription to /api/subscribe:', e);
    }

    localStorage.setItem('maamulat_push_enabled', 'true');
    return { success: true, subscription };
  } catch (err: any) {
    console.error('Failed to subscribe to push notifications:', err);
    return { success: false, error: err?.message || 'Could not subscribe to push notifications.' };
  }
}

/**
 * Unsubscribes the current device from push notifications.
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      try {
        await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'unsubscribe',
            endpoint: subscription.endpoint
          })
        });
      } catch (e) {
        console.warn('Backend sync failed on unsubscribe:', e);
      }

      await subscription.unsubscribe();
    }

    localStorage.removeItem('maamulat_push_enabled');
    return true;
  } catch (err) {
    console.error('Failed to unsubscribe:', err);
    return false;
  }
}

/**
 * Check if the user is currently subscribed
 */
export async function checkIsSubscribed(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}
