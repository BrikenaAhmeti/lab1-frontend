export const AUTH_RETURN_TO_KEY = 'auth.returnTo';
export const DEFAULT_AUTH_REDIRECT = '/dashboard';
export const LOGIN_PATH = '/login';

type LocationLike = {
  pathname?: string;
  search?: string;
  hash?: string;
};

export function buildLocationPath(location: LocationLike) {
  return `${location.pathname || ''}${location.search || ''}${location.hash || ''}`;
}

export function sanitizeReturnTo(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }

  const pathOnly = trimmed.split(/[?#]/)[0] || '/';

  if (pathOnly === LOGIN_PATH) {
    return null;
  }

  return trimmed;
}

export function getReturnToFromRouteState(state: unknown) {
  if (!state || typeof state !== 'object' || !('from' in state)) {
    return null;
  }

  const from = (state as { from?: unknown }).from;

  if (typeof from === 'string') {
    return sanitizeReturnTo(from);
  }

  if (from && typeof from === 'object') {
    return sanitizeReturnTo(buildLocationPath(from as LocationLike));
  }

  return null;
}

export function resolveAuthReturnTo(candidates: unknown[], fallback = DEFAULT_AUTH_REDIRECT) {
  for (const candidate of candidates) {
    const returnTo = sanitizeReturnTo(candidate);

    if (returnTo) {
      return returnTo;
    }
  }

  return fallback;
}

export function readStoredAuthReturnTo() {
  if (typeof window === 'undefined') {
    return null;
  }

  return sanitizeReturnTo(sessionStorage.getItem(AUTH_RETURN_TO_KEY));
}

export function rememberAuthReturnTo(returnTo: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const safeReturnTo = sanitizeReturnTo(returnTo);

  if (safeReturnTo) {
    sessionStorage.setItem(AUTH_RETURN_TO_KEY, safeReturnTo);
  }
}

export function clearStoredAuthReturnTo() {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
}

export function getCurrentAuthReturnTo() {
  if (typeof window === 'undefined') {
    return DEFAULT_AUTH_REDIRECT;
  }

  return sanitizeReturnTo(buildLocationPath(window.location)) || DEFAULT_AUTH_REDIRECT;
}

export function buildLoginPath(returnTo: string) {
  const safeReturnTo = sanitizeReturnTo(returnTo);

  return safeReturnTo
    ? `${LOGIN_PATH}?returnTo=${encodeURIComponent(safeReturnTo)}`
    : LOGIN_PATH;
}
