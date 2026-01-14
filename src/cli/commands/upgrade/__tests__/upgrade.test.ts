import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestConfig } from '../../../../__tests__/helpers/create-test-config';
import { calculateDiff } from '../../../../lib/diff-calculator/calculate-diff';
import { copyRulesToTarget, readConfigFile, writeConfigFile } from '../../../../lib/file-operations';
import { fetchPromptsTarball, getLatestPromptsVersion } from '../../../../lib/github-fetcher';
import { getInitializedIdes } from '../../../../lib/ide-config';
import { getPackageVersion } from '../../../../lib/version-manager/get-package-version';
import { upgradeCommand } from '../index';

vi.mock('node:fs/promises');
vi.mock('../../../../lib/diff-calculator/calculate-diff');
vi.mock('../../../../lib/file-operations');
vi.mock('../../../../lib/github-fetcher');
vi.mock('../../../../lib/ide-config');
vi.mock('../../../../lib/version-manager/get-package-version');

const mockGetPackageVersion = vi.mocked(getPackageVersion);
const mockCalculateDiff = vi.mocked(calculateDiff);
const mockCopyRulesToTarget = vi.mocked(copyRulesToTarget);
const mockReadConfigFile = vi.mocked(readConfigFile);
const mockWriteConfigFile = vi.mocked(writeConfigFile);
const mockFetchPromptsTarball = vi.mocked(fetchPromptsTarball);
const mockGetLatestPromptsVersion = vi.mocked(getLatestPromptsVersion);
const mockGetInitializedIdes = vi.mocked(getInitializedIdes);

describe('upgradeCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetInitializedIdes.mockResolvedValue(['cursor'] as const);
    });

    it('должен успешно обновлять правила при наличии diff', async () => {
        const config = createTestConfig({ promptsVersion: '2025.11.01.1' });

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

        await upgradeCommand('/package/dir', '/target/dir');

        expect(mockGetInitializedIdes).toHaveBeenCalledWith('/target/dir');
        expect(mockGetLatestPromptsVersion).toHaveBeenCalledWith('CyberWalrus/ai-rules-kit');
        expect(mockFetchPromptsTarball).toHaveBeenCalled();
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockReadConfigFile).toHaveBeenCalledWith('/target/dir', 'cursor');
        expect(mockCalculateDiff).toHaveBeenCalled();
        expect(mockCopyRulesToTarget).toHaveBeenCalled();
        expect(mockWriteConfigFile).toHaveBeenCalled();
    });

    it('должен выбрасывать ошибку если packageDir не указан', async () => {
        await expect(upgradeCommand('', '/target/dir')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если packageDir null', async () => {
        await expect(upgradeCommand(null as unknown as string, '/target/dir')).rejects.toThrow(
            'packageDir is required',
        );
    });

    it('должен выбрасывать ошибку если targetDir не указан', async () => {
        await expect(upgradeCommand('/package/dir', '')).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если targetDir null', async () => {
        await expect(upgradeCommand('/package/dir', null as unknown as string)).rejects.toThrow(
            'targetDir is required',
        );
    });

    it('должен выбрасывать ошибку если правила не инициализированы', async () => {
        mockGetInitializedIdes.mockResolvedValue([]);

        await expect(upgradeCommand('/package/dir', '/target/dir')).rejects.toThrow(
            'Rules not initialized. Run init command first.',
        );
    });

    it('должен обновлять файлы даже если версии одинаковые', async () => {
        const config = createTestConfig({ promptsVersion: '2025.11.01.1' });

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

        await upgradeCommand('/package/dir', '/target/dir');

        expect(mockGetLatestPromptsVersion).toHaveBeenCalled();
        expect(mockFetchPromptsTarball).toHaveBeenCalled();
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockReadConfigFile).toHaveBeenCalledWith('/target/dir', 'cursor');
        expect(mockCalculateDiff).toHaveBeenCalled();
        expect(mockCopyRulesToTarget).toHaveBeenCalled();
        expect(mockWriteConfigFile).toHaveBeenCalled();
    });

    it('должен обновлять несколько IDE', async () => {
        const config1 = createTestConfig({ ideType: 'cursor' as const, promptsVersion: '2025.11.01.1' });
        const config2 = createTestConfig({ ideType: 'trae' as const, promptsVersion: '2025.11.01.1' });

        mockGetInitializedIdes.mockResolvedValue(['cursor', 'trae'] as const);
        mockReadConfigFile.mockImplementation((targetDir, ideType) => {
            if (ideType === 'cursor') {
                return Promise.resolve(config1);
            }
            if (ideType === 'trae') {
                return Promise.resolve(config2);
            }

            return Promise.resolve(null);
        });
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('1.0.0');
        mockCalculateDiff.mockResolvedValue({
            toAdd: [],
            toDelete: [],
            toUpdate: ['.cursor/rules'],
        });
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        try {
            await upgradeCommand('/package/dir', '/target/dir');

            // config читается для каждой IDE плюс 1 раз для проверки версии первой IDE
            expect(mockReadConfigFile).toHaveBeenCalledTimes(3);
            expect(mockWriteConfigFile).toHaveBeenCalledTimes(2);
        } finally {
            consoleLogSpy.mockRestore();
        }
    });
});
