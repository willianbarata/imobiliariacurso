const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function loginAllowed(key: string) {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= Date.now()) return true;
  return entry.count < MAX_ATTEMPTS;
}

export function recordFailedLogin(key: string) {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= Date.now()) {
    attempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearFailedLogins(key: string) {
  attempts.delete(key);
}
