import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestConfig } from '../../../../__tests__/helpers/create-test-config';
import { calculateDiff } from '../../../../lib/diff-calculator/calculate-diff';
import { copyRulesToTarget, readConfigFile, writeConfigFile } from '../../../../lib/file-operations';
import { fetchPromptsTarball, getLatestPromptsVersion } from '../../../../lib/github-fetcher';
import { getCurrentVersion } from '../../../../lib/version-manager/get-current-version';
import { getPackageVersion } from '../../../../lib/version-manager/get-package-version';
import { updateCommand } from '../index';

vi.mock('node:fs/promises');
vi.mock('../../../../lib/diff-calculator/calculate-diff');
vi.mock('../../../../lib/file-operations');
vi.mock('../../../../lib/github-fetcher');
vi.mock('../../../../lib/version-manager/get-current-version');
vi.mock('../../../../lib/version-manager/get-package-version');

const mockGetCurrentVersion = vi.mocked(getCurrentVersion);
const mockGetPackageVersion = vi.mocked(getPackageVersion);
const mockCalculateDiff = vi.mocked(calculateDiff);
const mockCopyRulesToTarget = vi.mocked(copyRulesToTarget);
const mockReadConfigFile = vi.mocked(readConfigFile);
const mockWriteConfigFile = vi.mocked(writeConfigFile);
const mockFetchPromptsTarball = vi.mocked(fetchPromptsTarball);
const mockGetLatestPromptsVersion = vi.mocked(getLatestPromptsVersion);

describe('updateCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен успешно обновлять правила при наличии diff', async () => {
        const config = {
            cliVersion: '1.0.0',
            configVersion: '1.0.0',
            installedAt: '2025-11-01T12:00:00.000Z',
            promptsVersion: '2025.11.01.1',
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: 'ru' as const,
            },
            source: 'cursor-rules',
            updatedAt: '2025-11-01T12:00:00.000Z',
        };

        mockGetCurrentVersion.mockResolvedValue('2025.11.01.1');
        mockReadConfigFile.mockResolvedValue(config);
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('1.1.0');
        mockCalculateDiff.mockResolvedValue({
            toAdd: [],
            toDelete: [],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockGetCurrentVersion).toHaveBeenCalledWith('/target/dir');
        expect(mockGetLatestPromptsVersion).toHaveBeenCalledWith('CyberWalrus/cursor-rules');
        expect(mockFetchPromptsTarball).toHaveBeenCalled();
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockReadConfigFile).toHaveBeenCalledWith('/target/dir');
        expect(mockCalculateDiff).toHaveBeenCalled();
        expect(mockCopyRulesToTarget).toHaveBeenCalled();
        expect(mockWriteConfigFile).toHaveBeenCalled();
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

    it('должен обновлять файлы даже если версии одинаковые', async () => {
        const config = createTestConfig({ promptsVersion: '2025.11.01.1' });

        mockGetCurrentVersion.mockResolvedValue('2025.11.01.1');
        mockReadConfigFile.mockResolvedValue(config);
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('1.0.0');
        mockCalculateDiff.mockResolvedValue({
            toAdd: ['.cursor/rules/new-file.mdc'],
            toDelete: [],
            toUpdate: ['.cursor/rules/existing-file.mdc'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockGetCurrentVersion).toHaveBeenCalledWith('/target/dir');
        expect(mockGetLatestPromptsVersion).toHaveBeenCalled();
        expect(mockFetchPromptsTarball).toHaveBeenCalled();
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockReadConfigFile).toHaveBeenCalledWith('/target/dir');
        expect(mockCalculateDiff).toHaveBeenCalled();
        expect(mockCopyRulesToTarget).toHaveBeenCalled();
        expect(mockWriteConfigFile).toHaveBeenCalled();
    });

    it('должен пропускать обновление если нет ruleSets с update: true', async () => {
        const config = createTestConfig({
            ruleSets: [
                {
                    id: 'base',
                    update: false,
                },
            ],
        });

        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('1.1.0');
        mockReadConfigFile.mockResolvedValue(config);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockCalculateDiff).not.toHaveBeenCalled();
        expect(mockCopyRulesToTarget).not.toHaveBeenCalled();
        expect(mockWriteConfigFile).not.toHaveBeenCalled();
    });

    it('должен вызывать calculateDiff для вычисления изменений', async () => {
        const config = createTestConfig({ promptsVersion: '2025.11.01.1' });

        mockGetCurrentVersion.mockResolvedValue('1.0.0');
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockReadConfigFile.mockResolvedValue(config);
        mockCalculateDiff.mockResolvedValue({
            toAdd: ['.cursor/new'],
            toDelete: ['.cursor/old'],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockCalculateDiff).toHaveBeenCalled();
    });

    it('должен обновлять версию через writeConfigFile', async () => {
        const config = createTestConfig({ promptsVersion: '2025.11.01.1' });

        mockGetCurrentVersion.mockResolvedValue('2025.11.01.1');
        mockGetPackageVersion.mockResolvedValue('1.2.0');
        mockReadConfigFile.mockResolvedValue(config);
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockCalculateDiff.mockResolvedValue({
            toAdd: [],
            toDelete: [],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockWriteConfigFile).toHaveBeenCalledTimes(1);
        expect(mockWriteConfigFile).toHaveBeenCalled();
    });

    it('должен обрабатывать patch обновления', async () => {
        const config = createTestConfig({ promptsVersion: '2025.11.01.1' });

        mockGetCurrentVersion.mockResolvedValue('2025.11.01.1');
        mockGetPackageVersion.mockResolvedValue('1.0.1');
        mockReadConfigFile.mockResolvedValue(config);
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockCalculateDiff.mockResolvedValue({
            toAdd: [],
            toDelete: [],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await updateCommand('/package/dir', '/target/dir');

        expect(mockCopyRulesToTarget).toHaveBeenCalled();
        expect(mockWriteConfigFile).toHaveBeenCalled();
    });
});
