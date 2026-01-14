import { beforeEach, describe, expect, it, vi } from 'vitest';

import { copyRulesToTarget } from '../../../../lib/file-operations/copy-rules-to-target';
import { copySystemRulesToTarget } from '../../../../lib/file-operations/copy-system-rules-to-target';
import { readConfigFile } from '../../../../lib/file-operations/read-config-file';
import { writeConfigFile } from '../../../../lib/file-operations/write-config-file';
import {
    fetchPromptsTarball,
    fetchSystemRulesTarball,
    getLatestSystemRulesVersion,
} from '../../../../lib/github-fetcher';
import { getUninitializedIdes } from '../../../../lib/ide-config';
import { readUserConfig } from '../../../../lib/user-config';
import { getPackageVersion } from '../../../../lib/version-manager/get-package-version';
import { getVersionsWithRetry } from '../../../../lib/version-manager/get-versions-with-retry';
import { initCommand } from '../index';

vi.mock('node:fs/promises');
vi.mock('@clack/prompts', () => ({
    select: vi.fn().mockResolvedValue('cursor'),
}));
vi.mock('../../../../lib/file-operations/copy-rules-to-target');
vi.mock('../../../../lib/file-operations/copy-system-rules-to-target');
vi.mock('../../../../lib/file-operations/read-config-file');
vi.mock('../../../../lib/file-operations/write-config-file');
vi.mock('../../../../lib/github-fetcher');
vi.mock('../../../../lib/ide-config');
vi.mock('../../../../lib/user-config');
vi.mock('../../../../lib/version-manager/get-package-version');
vi.mock('../../../../lib/version-manager/get-versions-with-retry');

const mockCopyRulesToTarget = vi.mocked(copyRulesToTarget);
const mockCopySystemRulesToTarget = vi.mocked(copySystemRulesToTarget);
const mockGetPackageVersion = vi.mocked(getPackageVersion);
const mockReadConfigFile = vi.mocked(readConfigFile);
const mockWriteConfigFile = vi.mocked(writeConfigFile);
const mockFetchPromptsTarball = vi.mocked(fetchPromptsTarball);
const mockFetchSystemRulesTarball = vi.mocked(fetchSystemRulesTarball);
const mockGetLatestSystemRulesVersion = vi.mocked(getLatestSystemRulesVersion);
const mockGetVersionsWithRetry = vi.mocked(getVersionsWithRetry);
const mockReadUserConfig = vi.mocked(readUserConfig);
const mockGetUninitializedIdes = vi.mocked(getUninitializedIdes);

describe('initCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockReadUserConfig.mockResolvedValue(null);
        mockGetVersionsWithRetry.mockResolvedValue({ promptsVersion: '2025.11.10.1', systemRulesVersion: null });
        mockCopySystemRulesToTarget.mockResolvedValue(undefined);
        mockFetchSystemRulesTarball.mockResolvedValue(undefined);
        mockGetLatestSystemRulesVersion.mockResolvedValue(null);
        mockGetUninitializedIdes.mockResolvedValue(['cursor', 'trae', 'claude-code'] as const);
        mockReadConfigFile.mockResolvedValue(null);
    });

    it('должен успешно инициализировать правила в чистой директории', async () => {
        mockGetVersionsWithRetry.mockResolvedValue({ promptsVersion: '2025.11.10.1', systemRulesVersion: null });
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('1.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        await initCommand('/package/dir', '/target/dir');

        expect(mockGetUninitializedIdes).toHaveBeenCalledWith('/target/dir');
        expect(mockGetVersionsWithRetry).toHaveBeenCalledTimes(1);
        expect(mockFetchPromptsTarball).toHaveBeenCalledWith(
            'CyberWalrus/ai-rules-kit',
            '2025.11.10.1',
            expect.any(String),
        );
        expect(mockCopyRulesToTarget).toHaveBeenCalled();
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockWriteConfigFile).toHaveBeenCalledWith(
            '/target/dir',
            {
                cliVersion: '1.0.0',
                configVersion: '1.0.0',
                fileOverrides: [],
                ideType: 'cursor',
                ignoreList: [],
                installedAt: expect.any(String),
                promptsVersion: '2025.11.10.1',
                ruleSets: [
                    {
                        id: 'base',
                        update: true,
                    },
                ],
                settings: {
                    language: 'en',
                },
                source: 'ai-rules-kit',
                systemRulesVersion: undefined,
                updatedAt: expect.any(String),
            },
            'cursor',
        );
    });

    it('должен выбрасывать ошибку если packageDir не указан', async () => {
        await expect(initCommand('', '/target/dir')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если packageDir null', async () => {
        await expect(initCommand(null as unknown as string, '/target/dir')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если targetDir не указан', async () => {
        await expect(initCommand('/package/dir', '')).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если targetDir null', async () => {
        await expect(initCommand('/package/dir', null as unknown as string)).rejects.toThrow('targetDir is required');
    });

    it('должен показывать сообщение и завершать работу если все IDE инициализированы', async () => {
        mockGetUninitializedIdes.mockResolvedValue([]);

        // Мокаем select чтобы вернуть 'done'
        const { select } = await import('@clack/prompts');
        vi.mocked(select).mockResolvedValue('done' as never);

        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        try {
            await initCommand('/package/dir', '/target/dir');

            expect(mockGetVersionsWithRetry).not.toHaveBeenCalled();
            expect(mockFetchPromptsTarball).not.toHaveBeenCalled();
            expect(mockWriteConfigFile).not.toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('IDE'));
        } finally {
            consoleLogSpy.mockRestore();
            // Восстанавливаем дефолтный мок
            vi.mocked(select).mockResolvedValue('cursor' as never);
        }
    });

    it('должен завершать работу если выбрана опция "Завершить работу"', async () => {
        mockGetUninitializedIdes.mockResolvedValue(['cursor', 'trae'] as const);

        // Мокаем select чтобы вернуть 'done'
        const { select } = await import('@clack/prompts');
        vi.mocked(select).mockResolvedValue('done' as never);

        try {
            await initCommand('/package/dir', '/target/dir');

            expect(mockGetVersionsWithRetry).not.toHaveBeenCalled();
            expect(mockFetchPromptsTarball).not.toHaveBeenCalled();
            expect(mockWriteConfigFile).not.toHaveBeenCalled();
        } finally {
            // Восстанавливаем дефолтный мок
            vi.mocked(select).mockResolvedValue('cursor' as never);
        }
    });

    it('должен скачивать и копировать правила через GitHub', async () => {
        mockGetVersionsWithRetry.mockResolvedValue({ promptsVersion: '2025.11.10.1', systemRulesVersion: null });
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('1.0.0');
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await initCommand('/package/dir', '/target/dir');

        expect(mockGetVersionsWithRetry).toHaveBeenCalledTimes(1);
        expect(mockFetchPromptsTarball).toHaveBeenCalledTimes(1);
        expect(mockCopyRulesToTarget).toHaveBeenCalledTimes(1);
    });

    it('должен записывать конфигурацию через writeConfigFile', async () => {
        mockGetVersionsWithRetry.mockResolvedValue({ promptsVersion: '2025.11.10.1', systemRulesVersion: null });
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await initCommand('/package/dir', '/target/dir');

        expect(mockWriteConfigFile).toHaveBeenCalledTimes(1);
        expect(mockWriteConfigFile).toHaveBeenCalledWith(
            '/target/dir',
            {
                cliVersion: '2.0.0',
                configVersion: '1.0.0',
                fileOverrides: [],
                ideType: 'cursor',
                ignoreList: [],
                installedAt: expect.any(String),
                promptsVersion: '2025.11.10.1',
                ruleSets: [
                    {
                        id: 'base',
                        update: true,
                    },
                ],
                settings: {
                    language: 'en',
                },
                source: 'ai-rules-kit',
                systemRulesVersion: undefined,
                updatedAt: expect.any(String),
            },
            'cursor',
        );
    });

    it('должен записывать корректный ISO timestamp в installedAt и updatedAt', async () => {
        mockGetVersionsWithRetry.mockResolvedValue({ promptsVersion: '2025.11.10.1', systemRulesVersion: null });
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('1.0.0');
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        const beforeCall = new Date();
        await initCommand('/package/dir', '/target/dir');
        const afterCall = new Date();

        const callArgs = mockWriteConfigFile.mock.calls[0];
        const config = callArgs[1];
        const installedAt = new Date(config.installedAt);
        const updatedAt = new Date(config.updatedAt);

        expect(installedAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
        expect(installedAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
        expect(updatedAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
});
