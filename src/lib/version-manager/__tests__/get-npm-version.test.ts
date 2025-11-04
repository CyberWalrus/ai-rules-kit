import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getNpmVersion } from '../get-npm-version';

const { mockFetch } = vi.hoisted(() => ({
    mockFetch: vi.fn(),
}));

global.fetch = mockFetch;

describe('getNpmVersion', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
        global.fetch = mockFetch;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    it('должен получать версию из npm registry', async () => {
        const mockResponse = { version: '1.2.3' };
        mockFetch.mockResolvedValue({
            json: () => Promise.resolve(mockResponse),
            ok: true,
        });

        const version = await getNpmVersion('test-package');

        expect(version).toBe('1.2.3');
        expect(mockFetch).toHaveBeenCalledWith(
            'https://registry.npmjs.org/test-package/latest',
            expect.objectContaining({
                signal: expect.any(AbortSignal),
            }),
        );
    });

    it('должен выбрасывать ошибку если packageName пустой', async () => {
        await expect(getNpmVersion('')).rejects.toThrow('packageName is required');
    });

    it('должен выбрасывать ошибку если packageName null', async () => {
        await expect(getNpmVersion(null as unknown as string)).rejects.toThrow('packageName is required');
    });

    it('должен выбрасывать ошибку если packageName undefined', async () => {
        await expect(getNpmVersion(undefined as unknown as string)).rejects.toThrow('packageName is required');
    });

    it('должен выбрасывать ошибку если response не ok', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 404,
            statusText: 'Not Found',
        });

        await expect(getNpmVersion('test-package')).rejects.toThrow('Failed to fetch package version: 404 Not Found');
    });

    it('должен выбрасывать ошибку если версия отсутствует в ответе', async () => {
        mockFetch.mockResolvedValue({
            json: () => Promise.resolve({}),
            ok: true,
        });

        await expect(getNpmVersion('test-package')).rejects.toThrow('Invalid version format in npm registry response');
    });

    it('должен выбрасывать ошибку если версия пустая', async () => {
        mockFetch.mockResolvedValue({
            json: () => Promise.resolve({ version: '' }),
            ok: true,
        });

        await expect(getNpmVersion('test-package')).rejects.toThrow('Invalid version format in npm registry response');
    });

    it('должен выбрасывать ошибку при timeout', async () => {
        const abortError = new DOMException('The operation was aborted.', 'AbortError');
        mockFetch.mockRejectedValue(abortError);

        await expect(getNpmVersion('test-package')).rejects.toThrow(
            'Request timeout: npm registry did not respond in time',
        );
    });

    it('должен обрабатывать сетевые ошибки', async () => {
        const networkError = new Error('Network error');
        mockFetch.mockRejectedValue(networkError);

        await expect(getNpmVersion('test-package')).rejects.toThrow('Failed to get npm version: Network error');
    });
});
