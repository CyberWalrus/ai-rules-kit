import { beforeEach, describe, expect, it, vi } from 'vitest';

import { calculateDiff } from '../../../../lib/diff-calculator/calculate-diff';
import { copyRulesToTarget } from '../../../../lib/file-operations/copy-rules-to-target';
import { writeVersionFile } from '../../../../lib/file-operations/write-version-file';
import { compareVersions } from '../../../../lib/version-manager/compare-versions';
import { getCurrentVersion } from '../../../../lib/version-manager/get-current-version';
import { getPackageVersion } from '../../../../lib/version-manager/get-package-version';
import { updateCommand } from '../index';

vi.mock('../../../../lib/diff-calculator/calculate-diff');
vi.mock('../../../../lib/file-operations/copy-rules-to-target');
vi.mock('../../../../lib/file-operations/write-version-file');
vi.mock('../../../../lib/version-manager/compare-versions');
vi.mock('../../../../lib/version-manager/get-current-version');
vi.mock('../../../../lib/version-manager/get-package-version');

const mockGetCurrentVersion = vi.mocked(getCurrentVersion);
const mockGetPackageVersion = vi.mocked(getPackageVersion);
const mockCompareVersions = vi.mocked(compareVersions);
const mockCalculateDiff = vi.mocked(calculateDiff);
const mockCopyRulesToTarget = vi.mocked(copyRulesToTarget);
const mockWriteVersionFile = vi.mocked(writeVersionFile);

describe('updateCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен успешно обновлять правила при наличии diff', async () => {
        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('1.1.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'minor',
            current: '1.0.0',
            target: '1.1.0',
        });
        mockCalculateDiff.mockReturnValue({
            toAdd: [],
            toDelete: [],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteVersionFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockGetCurrentVersion).toHaveBeenCalledWith('/target/dir');
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockCompareVersions).toHaveBeenCalledWith('1.0.0', '1.1.0');
        expect(mockCalculateDiff).toHaveBeenCalledWith('1.0.0', '1.1.0');
        expect(mockCopyRulesToTarget).toHaveBeenCalledWith('/package/dir', '/target/dir');
        expect(mockWriteVersionFile).toHaveBeenCalledWith('/target/dir', {
            installedAt: expect.any(String),
            source: 'cursor-rules',
            version: '1.1.0',
        });
    });

    it('должен выбрасывать ошибку если packageDir не указан', async () => {
        await expect(updateCommand('', '/target/dir')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если packageDir null', async () => {
        await expect(updateCommand(null as unknown as string, '/target/dir')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если targetDir не указан', async () => {
        await expect(updateCommand('/package/dir', '')).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если targetDir null', async () => {
        await expect(updateCommand('/package/dir', null as unknown as string)).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если правила не инициализированы', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);

        await expect(updateCommand('/package/dir', '/target/dir')).rejects.toThrow(
            'Rules not initialized. Run init command first.',
        );
    });

    it('должен пропускать обновление если версии одинаковые', async () => {
        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('1.0.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'none',
            current: '1.0.0',
            target: '1.0.0',
        });

        await updateCommand('/package/dir', '/target/dir');

        expect(mockGetCurrentVersion).toHaveBeenCalledWith('/target/dir');
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockCompareVersions).toHaveBeenCalledWith('1.0.0', '1.0.0');
        expect(mockCalculateDiff).not.toHaveBeenCalled();
        expect(mockCopyRulesToTarget).not.toHaveBeenCalled();
        expect(mockWriteVersionFile).not.toHaveBeenCalled();
    });

    it('должен вызывать calculateDiff для вычисления изменений', async () => {
        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'major',
            current: '1.0.0',
            target: '2.0.0',
        });
        mockCalculateDiff.mockReturnValue({
            toAdd: ['.cursor/new'],
            toDelete: ['.cursor/old'],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteVersionFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockCalculateDiff).toHaveBeenCalledTimes(1);
        expect(mockCalculateDiff).toHaveBeenCalledWith('1.0.0', '2.0.0');
    });

    it('должен обновлять версию через writeVersionFile', async () => {
        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('1.2.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'minor',
            current: '1.0.0',
            target: '1.2.0',
        });
        mockCalculateDiff.mockReturnValue({
            toAdd: [],
            toDelete: [],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteVersionFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockWriteVersionFile).toHaveBeenCalledTimes(1);
        expect(mockWriteVersionFile).toHaveBeenCalledWith('/target/dir', {
            installedAt: expect.any(String),
            source: 'cursor-rules',
            version: '1.2.0',
        });
    });

    it('должен записывать корректный ISO timestamp в installedAt', async () => {
        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('1.1.0');
        mockCompareVersions.mockReturnValue({
            changeType: 'minor',
            current: '1.0.0',
            target: '1.1.0',
        });
        mockCalculateDiff.mockReturnValue({
            toAdd: [],
            toDelete: [],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteVersionFile.mockResolvedValue(undefined);

        const beforeCall = new Date();
        await updateCommand('/package/dir', '/target/dir');
        const afterCall = new Date();

        const callArgs = mockWriteVersionFile.mock.calls[0];
        const versionInfo = callArgs[1];
        const installedAt = new Date(versionInfo.installedAt);

        expect(installedAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
        expect(installedAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('должен обрабатывать patch обновления', async () => {
        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('1.0.1');
        mockCompareVersions.mockReturnValue({
            changeType: 'patch',
            current: '1.0.0',
            target: '1.0.1',
        });
        mockCalculateDiff.mockReturnValue({
            toAdd: [],
            toDelete: [],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteVersionFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockCompareVersions).toHaveBeenCalledWith('1.0.0', '1.0.1');
        expect(mockCopyRulesToTarget).toHaveBeenCalled();
        expect(mockWriteVersionFile).toHaveBeenCalled();
    });
});
