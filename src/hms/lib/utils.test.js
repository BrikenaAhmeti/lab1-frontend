import { buildQueryString, normalizeListResponse } from './utils';
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
});
