/**
 * Safely parses a Fetch Response body as JSON.
 *
 * If the response body cannot be parsed as JSON (e.g. Vercel plain-text 500
 * error "A server error has occurred" or HTML error pages), this falls back
 * gracefully to an object with an `error` property containing the text or default message.
 */
export async function parseJsonResponse<T = any>(
  res: Response,
  fallbackError: string = 'Invalid server response'
): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return { error: text?.trim() || fallbackError } as T;
  }
}
