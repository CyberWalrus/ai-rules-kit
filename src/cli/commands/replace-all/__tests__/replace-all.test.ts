import { beforeEach, describe, expect, it, vi } from 'vitest';

import { copyRulesToTarget } from '../../../../lib/file-operations/copy-rules-to-target';
import { deleteRulesFromTarget } from '../../../../lib/file-operations/delete-rules-from-target';
import { writeVersionFile } from '../../../../lib/file-operations/write-version-file';
import { getPackageVersion } from '../../../../lib/version-manager/get-package-version';
import { replaceAllCommand } from '../index';

vi.mock('../../../../lib/file-operations/copy-rules-to-target');
vi.mock('../../../../lib/file-operations/delete-rules-from-target');
vi.mock('../../../../lib/file-operations/write-version-file');
vi.mock('../../../../lib/version-manager/get-package-version');

const mockDeleteRulesFromTarget = vi.mocked(deleteRulesFromTarget);
const mockCopyRulesToTarget = vi.mocked(copyRulesToTarget);
const mockGetPackageVersion = vi.mocked(getPackageVersion);
const mockWriteVersionFile = vi.mocked(writeVersionFile);

describe('replaceAllCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен успешно выполнять полную замену правил', async () => {
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteVersionFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockDeleteRulesFromTarget).toHaveBeenCalledWith('/target/dir');
        expect(mockCopyRulesToTarget).toHaveBeenCalledWith('/package/dir', '/target/dir');
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockWriteVersionFile).toHaveBeenCalledWith('/target/dir', {
            installedAt: expect.any(String),
            source: 'cursor-rules',
            version: '2.0.0',
        });
    });

    it('должен выбрасывать ошибку если packageDir не указан', async () => {
        await expect(replaceAllCommand('', '/target/dir')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если packageDir null', async () => {
        await expect(replaceAllCommand(null as unknown as string, '/target/dir')).rejects.toThrow(
            'packageDir is required',
        );
    });

    it('должен выбрасывать ошибку если targetDir не указан', async () => {
        await expect(replaceAllCommand('/package/dir', '')).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если targetDir null', async () => {
        await expect(replaceAllCommand('/package/dir', null as unknown as string)).rejects.toThrow(
            'targetDir is required',
        );
    });

    it('должен вызывать deleteRulesFromTarget перед копированием', async () => {
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteVersionFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockDeleteRulesFromTarget).toHaveBeenCalledTimes(1);
        expect(mockDeleteRulesFromTarget).toHaveBeenCalledWith('/target/dir');

        const deleteCallOrder = mockDeleteRulesFromTarget.mock.invocationCallOrder[0];
        const copyCallOrder = mockCopyRulesToTarget.mock.invocationCallOrder[0];
        expect(deleteCallOrder).toBeLessThan(copyCallOrder);
    });

    it('должен копировать правила через copyRulesToTarget', async () => {
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteVersionFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockCopyRulesToTarget).toHaveBeenCalledTimes(1);
        expect(mockCopyRulesToTarget).toHaveBeenCalledWith('/package/dir', '/target/dir');
    });

    it('должен записывать новую версию через writeVersionFile', async () => {
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('3.0.0');
        mockWriteVersionFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockWriteVersionFile).toHaveBeenCalledTimes(1);
        expect(mockWriteVersionFile).toHaveBeenCalledWith('/target/dir', {
            installedAt: expect.any(String),
            source: 'cursor-rules',
            version: '3.0.0',
        });
    });

    it('должен записывать корректный ISO timestamp в installedAt', async () => {
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteVersionFile.mockResolvedValue(undefined);

        const beforeCall = new Date();
        await replaceAllCommand('/package/dir', '/target/dir');
        const afterCall = new Date();

        const callArgs = mockWriteVersionFile.mock.calls[0];
        const versionInfo = callArgs[1];
        const installedAt = new Date(versionInfo.installedAt);

        expect(installedAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
        expect(installedAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('должен выполнять операции в правильном порядке', async () => {
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteVersionFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        const deleteCallOrder = mockDeleteRulesFromTarget.mock.invocationCallOrder[0];
        const copyCallOrder = mockCopyRulesToTarget.mock.invocationCallOrder[0];
        const versionCallOrder = mockGetPackageVersion.mock.invocationCallOrder[0];
        const writeCallOrder = mockWriteVersionFile.mock.invocationCallOrder[0];

        expect(deleteCallOrder).toBeLessThan(copyCallOrder);
        expect(copyCallOrder).toBeLessThan(versionCallOrder);
        expect(versionCallOrder).toBeLessThan(writeCallOrder);
    });
});
