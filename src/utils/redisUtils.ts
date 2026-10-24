import { DAILY_REMINDERS, type DefaultReminder } from '../constants/dailyReminders.js';

export interface RedisEnv {
  url?: string;
  token?: string;
  isConfigured: boolean;
}

/**
 * Read Upstash Redis environment variables
 */
export function getRedisEnv(): RedisEnv {
  const env = (typeof globalThis !== 'undefined' && (globalThis as any).process?.env)
    ? (globalThis as any).process.env
    : {};
  const url = env.KV_REST_API_URL;
  const token = env.KV_REST_API_TOKEN;
  return {
    url,
    token,
    isConfigured: Boolean(url && token)
  };
}

/**
 * Execute arbitrary Upstash Redis REST command via POST JSON array
 */
export async function runRedis(command: (string | number)[]): Promise<any> {
  const { url, token, isConfigured } = getRedisEnv();
  if (!isConfigured || !url || !token) return null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command)
    });
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.error('Redis command failed:', command[0], err);
    return null;
  }
}

/**
 * Fetch all push subscriptions from Upstash Set
 */
export async function getSubscriptions(): Promise<string[]> {
  const result = await runRedis(['SMEMBERS', 'maamulat_push_subscriptions']);
  return Array.isArray(result) ? result : [];
}

/**
 * Remove an expired or invalid subscription from Upstash Set
 */
export async function removeSubscription(subStr: string): Promise<boolean> {
  const result = await runRedis(['SREM', 'maamulat_push_subscriptions', subStr]);
  return Boolean(result);
}

/**
 * Load cloud reminders from Redis, auto-seeding with DAILY_REMINDERS if empty
 */
export async function getStoredReminders(): Promise<DefaultReminder[]> {
  const raw = await runRedis(['GET', 'maamulat_custom_reminders']);
  let list: any[] = [];
  if (raw) {
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    } catch {}
  }

  // Auto-seed into Redis if not yet stored
  if (list.length === 0) {
    list = DAILY_REMINDERS;
    await runRedis(['SET', 'maamulat_custom_reminders', JSON.stringify(list)]);
  }

  const hasDefault = list.some((r: any) => r.isDefault);
  return list.map((r: any, i: number) => ({
    id: r.id || `rem_${i + 1}`,
    title: r.title,
    body: r.body,
    url: r.url || '/?action=missing-reports',
    isDefault: hasDefault ? Boolean(r.isDefault) : i === 0
  }));
}

/**
 * Replace all reminders in Redis
 */
export async function saveStoredReminders(reminders: DefaultReminder[]): Promise<DefaultReminder[]> {
  const hasDefault = reminders.some((r) => r.isDefault);
  const normalized = reminders.map((r, i) => ({
    ...r,
    id: r.id || `rem_${i + 1}`,
    url: r.url || '/?action=missing-reports',
    isDefault: hasDefault ? Boolean(r.isDefault) : i === 0
  }));

  await runRedis(['SET', 'maamulat_custom_reminders', JSON.stringify(normalized)]);
  return normalized;
}

/**
 * Generic helper to mutate stored reminders in-place and persist to Redis
 */
export async function mutateStoredReminders(
  mutator: (list: DefaultReminder[]) => DefaultReminder[]
): Promise<DefaultReminder[]> {
  const current = await getStoredReminders();
  const modified = mutator(current);
  return saveStoredReminders(modified);
}

/**
 * Update a specific reminder in Redis
 */
export async function updateStoredReminder(
  updateData: Partial<DefaultReminder> & { id?: string },
  index?: number
): Promise<DefaultReminder[]> {
  const targetId = updateData.id;
  const targetIdx = index !== undefined ? Number(index) : -1;

  return mutateStoredReminders((list) =>
    list.map((item, i) => {
      const match = targetId ? item.id === targetId : i === targetIdx;
      if (!match) return item;
      return {
        ...item,
        title: updateData.title !== undefined ? String(updateData.title).trim() : item.title,
        body: updateData.body !== undefined ? String(updateData.body).trim() : item.body,
        url: updateData.url !== undefined ? String(updateData.url).trim() : item.url,
        isDefault: updateData.isDefault !== undefined ? Boolean(updateData.isDefault) : item.isDefault
      };
    })
  );
}

/**
 * Set a specific reminder as the default in Redis
 */
export async function setDefaultReminder(idOrIndex: string | number): Promise<DefaultReminder[]> {
  const isId = typeof idOrIndex === 'string';
  return mutateStoredReminders((list) =>
    list.map((item, i) => ({
      ...item,
      isDefault: isId ? item.id === idOrIndex : i === idOrIndex
    }))
  );
}

/**
 * Add a new reminder to Redis
 */
export async function addStoredReminder(reminder: {
  title: string;
  body: string;
  url?: string;
}): Promise<DefaultReminder[]> {
  return mutateStoredReminders((list) => [
    ...list,
    {
      id: `rem_${Date.now()}`,
      title: reminder.title.trim(),
      body: reminder.body.trim(),
      url: reminder.url?.trim() || '/?action=missing-reports',
      isDefault: list.length === 0
    }
  ]);
}

/**
 * Delete a reminder from Redis
 */
export async function deleteStoredReminder(idOrIndex: string | number): Promise<DefaultReminder[]> {
  return mutateStoredReminders((list) => {
    if (list.length <= 1) {
      throw new Error('You must keep at least one reminder in the cloud database.');
    }
    const isId = typeof idOrIndex === 'string';
    return list.filter((item, i) => (isId ? item.id !== idOrIndex : i !== idOrIndex));
  });
}

/**
 * Reset all reminders back to DAILY_REMINDERS in Redis
 */
export async function resetStoredReminders(): Promise<DefaultReminder[]> {
  return saveStoredReminders(DAILY_REMINDERS);
}

