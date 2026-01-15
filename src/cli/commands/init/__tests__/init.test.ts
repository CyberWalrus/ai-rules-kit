import { beforeEach, describe, expect, it, vi } from 'vitest';

import { runClaudeInit } from '../../../../lib/claude-cli';
import { copyRulesToTarget } from '../../../../lib/file-operations/copy-rules-to-target';
import { copySystemRulesToTarget } from '../../../../lib/file-operations/copy-system-rules-to-target';
import { pathExists } from '../../../../lib/file-operations/path-exists';
import { readConfigFile } from '../../../../lib/file-operations/read-config-file';
import { writeConfigFile } from '../../../../lib/file-operations/write-config-file';
import {
    fetchPromptsTarball,
    fetchSystemRulesTarball,
    getLatestSystemRulesVersion,
} from '../../../../lib/github-fetcher';
import { askConfirmation } from '../../../../lib/helpers';
import { getIdeRulesDir, getUninitializedIdes } from '../../../../lib/ide-config';
import { readUserConfig } from '../../../../lib/user-config';
import { getPackageVersion } from '../../../../lib/version-manager/get-package-version';
import { getVersionsWithRetry } from '../../../../lib/version-manager/get-versions-with-retry';
import { initCommand } from '../index';

vi.mock('node:fs/promises');
vi.mock('@clack/prompts', () => ({
    isCancel: vi.fn((value) => value === 'cancel'),
    select: vi.fn(),
}));
vi.mock('../../../../lib/claude-cli');
vi.mock('../../../../lib/file-operations/copy-rules-to-target');
vi.mock('../../../../lib/file-operations/copy-system-rules-to-target');
vi.mock('../../../../lib/file-operations/path-exists');
vi.mock('../../../../lib/file-operations/read-config-file');
vi.mock('../../../../lib/file-operations/write-config-file');
vi.mock('../../../../lib/github-fetcher');
vi.mock('../../../../lib/helpers');
vi.mock('../../../../lib/ide-config');
vi.mock('../../../../lib/user-config');
vi.mock('../../../../lib/version-manager/get-package-version');
vi.mock('../../../../lib/version-manager/get-versions-with-retry');

const mockRunClaudeInit = vi.mocked(runClaudeInit);
const mockCopyRulesToTarget = vi.mocked(copyRulesToTarget);
const mockCopySystemRulesToTarget = vi.mocked(copySystemRulesToTarget);
const mockPathExists = vi.mocked(pathExists);
const mockGetPackageVersion = vi.mocked(getPackageVersion);
const mockReadConfigFile = vi.mocked(readConfigFile);
const mockWriteConfigFile = vi.mocked(writeConfigFile);
const mockFetchPromptsTarball = vi.mocked(fetchPromptsTarball);
const mockFetchSystemRulesTarball = vi.mocked(fetchSystemRulesTarball);
const mockGetLatestSystemRulesVersion = vi.mocked(getLatestSystemRulesVersion);
const mockGetVersionsWithRetry = vi.mocked(getVersionsWithRetry);
const mockReadUserConfig = vi.mocked(readUserConfig);
const mockGetUninitializedIdes = vi.mocked(getUninitializedIdes);
const mockGetIdeRulesDir = vi.mocked(getIdeRulesDir);
const mockAskConfirmation = vi.mocked(askConfirmation);

describe('initCommand', () => {
    let mockSelect: {
        mockResolvedValue: (value: 'claude-code' | 'cursor' | 'done' | 'trae') => void;
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        const { select } = await import('@clack/prompts');
        mockSelect = vi.mocked(select) as typeof mockSelect;
        mockSelect.mockResolvedValue('cursor');
        mockReadUserConfig.mockResolvedValue(null);
        mockGetVersionsWithRetry.mockResolvedValue({ promptsVersion: '2025.11.10.1', systemRulesVersion: null });
        mockCopySystemRulesToTarget.mockResolvedValue(undefined);
        mockFetchSystemRulesTarball.mockResolvedValue(undefined);
        mockGetLatestSystemRulesVersion.mockResolvedValue(null);
        mockGetUninitializedIdes.mockResolvedValue(['cursor', 'trae', 'claude-code'] as const);
        mockGetIdeRulesDir.mockReturnValue('rules');
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

        // Когда нет неинициализированных IDE, в меню только одна опция "Завершить работу"
        mockSelect.mockResolvedValue('done');

        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        try {
            await initCommand('/package/dir', '/target/dir');

            expect(mockGetVersionsWithRetry).not.toHaveBeenCalled();
            expect(mockFetchPromptsTarball).not.toHaveBeenCalled();
            expect(mockWriteConfigFile).not.toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('IDE'));
        } finally {
            consoleLogSpy.mockRestore();
        }
    });

    it('должен завершать работу если выбрана опция "Завершить работу"', async () => {
        mockGetUninitializedIdes.mockResolvedValue(['cursor', 'trae'] as const);

        // Выбираем опцию "Завершить работу"
        mockSelect.mockResolvedValue('done');

        await initCommand('/package/dir', '/target/dir');

        expect(mockGetVersionsWithRetry).not.toHaveBeenCalled();
        expect(mockFetchPromptsTarball).not.toHaveBeenCalled();
        expect(mockWriteConfigFile).not.toHaveBeenCalled();
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

    it('должен передавать updateExisting = true если Claude CLI создал CLAUDE.md', async () => {
        mockSelect.mockResolvedValue('claude-code');
        mockGetUninitializedIdes.mockResolvedValue(['claude-code'] as const);
        mockGetIdeRulesDir.mockReturnValue('rules-kit');
        mockGetVersionsWithRetry.mockResolvedValue({ promptsVersion: '2025.11.10.1', systemRulesVersion: null });
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('1.0.0');
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);
        mockRunClaudeInit.mockResolvedValue(undefined);

        // Первый вызов pathExists для проверки существующего CLAUDE.md - не существует
        // Второй вызов после runClaudeInit - существует (Claude CLI создал файл)
        mockPathExists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

        // Пользователь соглашается на инициализацию через Claude CLI
        mockAskConfirmation.mockResolvedValue(true);

        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        try {
            await initCommand('/package/dir', '/target/dir');

            expect(mockRunClaudeInit).toHaveBeenCalledWith('/target/dir');
            expect(mockCopyRulesToTarget).toHaveBeenCalledWith(
                expect.any(String),
                '/target/dir',
                'claude-code',
                [],
                [],
                'rules-kit',
                true, // updateExisting должен быть true
            );
        } finally {
            consoleLogSpy.mockRestore();
        }
    });

    it('должен передавать updateExisting = false если Claude CLI не создал CLAUDE.md', async () => {
        mockSelect.mockResolvedValue('claude-code');
        mockGetUninitializedIdes.mockResolvedValue(['claude-code'] as const);
        mockGetIdeRulesDir.mockReturnValue('rules-kit');
        mockGetVersionsWithRetry.mockResolvedValue({ promptsVersion: '2025.11.10.1', systemRulesVersion: null });
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('1.0.0');
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);
        mockRunClaudeInit.mockResolvedValue(undefined);

        // Оба вызова pathExists возвращают false (CLAUDE.md не создан)
        mockPathExists.mockResolvedValue(false);

        // Пользователь соглашается на инициализацию через Claude CLI
        mockAskConfirmation.mockResolvedValue(true);

        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        try {
            await initCommand('/package/dir', '/target/dir');

            expect(mockRunClaudeInit).toHaveBeenCalledWith('/target/dir');
            expect(mockCopyRulesToTarget).toHaveBeenCalledWith(
                expect.any(String),
                '/target/dir',
                'claude-code',
                [],
                [],
                'rules-kit',
                false, // updateExisting должен быть false
            );
        } finally {
            consoleLogSpy.mockRestore();
        }
    });
});
