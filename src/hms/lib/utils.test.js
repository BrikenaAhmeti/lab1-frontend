import { buildQueryString, getErrorMessage, normalizeListResponse } from './utils';
describe('utils', () => {
    it('builds query strings without empty values', () => {
        expect(buildQueryString({
            page: 1,
            limit: 10,
            sortBy: 'created_at',
            order: 'DESC',
            search: 'john',
            status: '',
            doctorId: null,
        })).toBe('page=1&limit=10&sortBy=created_at&order=DESC&search=john');
    });
    it('normalizes paginated payloads', () => {
        expect(normalizeListResponse({
            data: [{ id: '1' }],
            total: 1,
            page: 2,
            limit: 20,
            totalPages: 4,
        })).toEqual({
            data: [{ id: '1' }],
            total: 1,
            page: 2,
            limit: 20,
            totalPages: 4,
        });
    });
    it('returns a friendly message for network errors', () => {
        expect(getErrorMessage({ message: 'Network Error', code: 'ERR_NETWORK' })).toBe('We could not reach the server. Check your connection and try again.');
    });
    it('returns a friendly message for server errors without a backend message', () => {
        expect(getErrorMessage({
            response: {
                status: 500,
                data: {},
            },
        })).toBe('The server is having trouble right now. Please try again in a moment.');
    });
});
