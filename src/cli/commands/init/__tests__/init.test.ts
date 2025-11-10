import { beforeEach, describe, expect, it, vi } from 'vitest';

import { copyRulesToTarget } from '../../../../lib/file-operations/copy-rules-to-target';
import { writeConfigFile } from '../../../../lib/file-operations/write-config-file';
import { fetchPromptsTarball, getLatestPromptsVersion } from '../../../../lib/github-fetcher';
import { getCurrentVersion } from '../../../../lib/version-manager/get-current-version';
import { getPackageVersion } from '../../../../lib/version-manager/get-package-version';
import { initCommand } from '../index';

vi.mock('node:fs/promises');
vi.mock('../../../../lib/file-operations/copy-rules-to-target');
vi.mock('../../../../lib/file-operations/write-config-file');
vi.mock('../../../../lib/github-fetcher');
vi.mock('../../../../lib/version-manager/get-current-version');
vi.mock('../../../../lib/version-manager/get-package-version');

const mockGetCurrentVersion = vi.mocked(getCurrentVersion);
const mockCopyRulesToTarget = vi.mocked(copyRulesToTarget);
const mockGetPackageVersion = vi.mocked(getPackageVersion);
const mockWriteConfigFile = vi.mocked(writeConfigFile);
const mockFetchPromptsTarball = vi.mocked(fetchPromptsTarball);
const mockGetLatestPromptsVersion = vi.mocked(getLatestPromptsVersion);

describe('initCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен успешно инициализировать правила в чистой директории', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('1.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        await initCommand('/package/dir', '/target/dir');

        expect(mockGetCurrentVersion).toHaveBeenCalledWith('/target/dir');
        expect(mockGetLatestPromptsVersion).toHaveBeenCalledWith('CyberWalrus/cursor-rules');
        expect(mockFetchPromptsTarball).toHaveBeenCalledWith(
            'CyberWalrus/cursor-rules',
            '2025.11.10.1',
            expect.stringContaining('cursor-rules-'),
        );
        expect(mockCopyRulesToTarget).toHaveBeenCalled();
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockWriteConfigFile).toHaveBeenCalledWith('/target/dir', {
            cliVersion: '1.0.0',
            configVersion: '1.0.0',
            fileOverrides: [],
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
                language: 'ru',
            },
            source: 'cursor-rules',
            updatedAt: expect.any(String),
        });
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

    it('должен выбрасывать ошибку если правила уже установлены', async () => {
        mockGetCurrentVersion.mockResolvedValue('1.0.0');

        await expect(initCommand('/package/dir', '/target/dir')).rejects.toThrow(
            'Rules already initialized with version 1.0.0',
        );
    });

    it('должен скачивать и копировать правила через GitHub', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('1.0.0');
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await initCommand('/package/dir', '/target/dir');

        expect(mockGetLatestPromptsVersion).toHaveBeenCalledTimes(1);
        expect(mockFetchPromptsTarball).toHaveBeenCalledTimes(1);
        expect(mockCopyRulesToTarget).toHaveBeenCalledTimes(1);
    });

    it('должен записывать конфигурацию через writeConfigFile', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockWriteConfigFile.mockResolvedValue(undefined);

        await initCommand('/package/dir', '/target/dir');

        expect(mockWriteConfigFile).toHaveBeenCalledTimes(1);
        expect(mockWriteConfigFile).toHaveBeenCalledWith('/target/dir', {
            cliVersion: '2.0.0',
            configVersion: '1.0.0',
            fileOverrides: [],
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
                language: 'ru',
            },
            source: 'cursor-rules',
            updatedAt: expect.any(String),
        });
    });

    it('должен записывать корректный ISO timestamp в installedAt и updatedAt', async () => {
        mockGetCurrentVersion.mockResolvedValue(null);
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
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
