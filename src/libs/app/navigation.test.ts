import { describe, expect, it } from 'vitest';
import {
  AUTH_RETURN_TO_KEY,
  buildLocationPath,
  buildLoginPath,
  DEFAULT_AUTH_REDIRECT,
  getReturnToFromRouteState,
  readStoredAuthReturnTo,
  rememberAuthReturnTo,
  resolveAuthReturnTo,
  sanitizeReturnTo,
} from './navigation';

describe('auth navigation helpers', () => {
  it('preserves the complete current route path', () => {
    expect(
      buildLocationPath({
        pathname: '/doctors',
        search: '?page=2&gender=FEMALE',
        hash: '#details',
      })
    ).toBe('/doctors?page=2&gender=FEMALE#details');
  });

  it('accepts only app-relative return paths', () => {
    expect(sanitizeReturnTo('/doctors?page=2')).toBe('/doctors?page=2');
    expect(sanitizeReturnTo('https://example.com/doctors')).toBe(null);
    expect(sanitizeReturnTo('//example.com/doctors')).toBe(null);
    expect(sanitizeReturnTo('/login')).toBe(null);
  });

  it('resolves route state and stored return paths before falling back', () => {
    expect(getReturnToFromRouteState({ from: { pathname: '/patients', search: '?page=3' } })).toBe(
      '/patients?page=3'
    );

    rememberAuthReturnTo('/appointments?status=SCHEDULED');

    expect(readStoredAuthReturnTo()).toBe('/appointments?status=SCHEDULED');
    expect(resolveAuthReturnTo([null, readStoredAuthReturnTo()])).toBe('/appointments?status=SCHEDULED');
    expect(resolveAuthReturnTo(['https://example.com'])).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sessionStorage.getItem(AUTH_RETURN_TO_KEY)).toBe('/appointments?status=SCHEDULED');
  });

  it('adds the return path to the login URL', () => {
    expect(buildLoginPath('/doctors?page=2&gender=FEMALE')).toBe(
      '/login?returnTo=%2Fdoctors%3Fpage%3D2%26gender%3DFEMALE'
    );
    expect(buildLoginPath('/login')).toBe('/login');
  });
});
