import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAndUpdatePackage } from '../check-and-update';
import { compareVersions } from '../compare-versions';
import { getNpmVersion } from '../get-npm-version';
import { updatePackage } from '../update-package';

vi.mock('../get-npm-version');
vi.mock('../update-package');
vi.mock('../compare-versions');

const mockGetNpmVersion = vi.mocked(getNpmVersion);
const mockUpdatePackage = vi.mocked(updatePackage);
const mockCompareVersions = vi.mocked(compareVersions);

describe('checkAndUpdatePackage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен обновлять пакет если версия устарела', async () => {
        mockGetNpmVersion.mockResolvedValue('2.0.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'major',
            current: '1.0.0',
            target: '2.0.0',
        });
        mockUpdatePackage.mockResolvedValue(undefined);

        const result = await checkAndUpdatePackage('test-package', '1.0.0');

        expect(result).toBe(true);
        expect(mockGetNpmVersion).toHaveBeenCalledWith('test-package');
        expect(mockCompareVersions).toHaveBeenCalledWith('1.0.0', '2.0.0');
        expect(mockUpdatePackage).toHaveBeenCalledWith('test-package');
    });

    it('должен возвращать false если версия актуальна', async () => {
        mockGetNpmVersion.mockResolvedValue('1.0.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'none',
            current: '1.0.0',
            target: '1.0.0',
        });

        const result = await checkAndUpdatePackage('test-package', '1.0.0');

        expect(result).toBe(false);
        expect(mockUpdatePackage).not.toHaveBeenCalled();
    });

    it('должен возвращать false если skipUpdate установлен', async () => {
        mockGetNpmVersion.mockResolvedValue('2.0.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'major',
            current: '1.0.0',
            target: '2.0.0',
        });

        const result = await checkAndUpdatePackage('test-package', '1.0.0', { isSkipUpdate: true });

        expect(result).toBe(false);
        expect(mockUpdatePackage).not.toHaveBeenCalled();
    });

    it('должен выбрасывать ошибку если currentVersion null', async () => {
        await expect(checkAndUpdatePackage('test-package', null as unknown as string)).rejects.toThrow(
            'currentVersion is required',
        );
    });

    it('должен выбрасывать ошибку если currentVersion undefined', async () => {
        await expect(checkAndUpdatePackage('test-package', undefined as unknown as string)).rejects.toThrow(
            'currentVersion is required',
        );
    });

    it('должен выбрасывать ошибку если packageName null', async () => {
        await expect(checkAndUpdatePackage(null as unknown as string, '1.0.0')).rejects.toThrow(
            'packageName is required',
        );
    });

    it('должен выбрасывать ошибку если packageName undefined', async () => {
        await expect(checkAndUpdatePackage(undefined as unknown as string, '1.0.0')).rejects.toThrow(
            'packageName is required',
        );
    });

    it('должен обрабатывать ошибки при получении версии', async () => {
        const error = new Error('Network error');
        mockGetNpmVersion.mockRejectedValue(error);

        await expect(checkAndUpdatePackage('test-package', '1.0.0')).rejects.toThrow(
            'Failed to check and update package: Network error',
        );
    });

    it('должен обрабатывать ошибки при обновлении', async () => {
        mockGetNpmVersion.mockResolvedValue('2.0.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'major',
            current: '1.0.0',
            target: '2.0.0',
        });
        const updateError = new Error('Update failed');
        mockUpdatePackage.mockRejectedValue(updateError);

        await expect(checkAndUpdatePackage('test-package', '1.0.0')).rejects.toThrow(
            'Failed to check and update package: Update failed',
        );
    });
});
