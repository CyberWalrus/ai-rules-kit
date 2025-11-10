import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestConfig } from '../../../../__tests__/helpers/create-test-config';
import {
    copyRulesToTarget,
    deleteRulesFromTarget,
    readConfigFile,
    writeConfigFile,
} from '../../../../lib/file-operations';
import { fetchPromptsTarball, getLatestPromptsVersion } from '../../../../lib/github-fetcher';
import { getPackageVersion } from '../../../../lib/version-manager/get-package-version';
import { replaceAllCommand } from '../index';

vi.mock('node:fs/promises');
vi.mock('../../../../lib/file-operations');
vi.mock('../../../../lib/github-fetcher');
vi.mock('../../../../lib/version-manager/get-package-version');

const mockDeleteRulesFromTarget = vi.mocked(deleteRulesFromTarget);
const mockCopyRulesToTarget = vi.mocked(copyRulesToTarget);
const mockFetchPromptsTarball = vi.mocked(fetchPromptsTarball);
const mockGetLatestPromptsVersion = vi.mocked(getLatestPromptsVersion);
const mockGetPackageVersion = vi.mocked(getPackageVersion);
const mockReadConfigFile = vi.mocked(readConfigFile);
const mockWriteConfigFile = vi.mocked(writeConfigFile);

describe('replaceAllCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен успешно выполнять полную замену правил', async () => {
        mockReadConfigFile.mockResolvedValue(null);
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockDeleteRulesFromTarget).toHaveBeenCalled();
        expect(mockGetLatestPromptsVersion).toHaveBeenCalled();
        expect(mockFetchPromptsTarball).toHaveBeenCalled();
        expect(mockCopyRulesToTarget).toHaveBeenCalled();
        expect(mockGetPackageVersion).toHaveBeenCalledWith('/package/dir');
        expect(mockWriteConfigFile).toHaveBeenCalled();
    });

    it('должен использовать существующий конфиг если он есть', async () => {
        const existingConfig = createTestConfig({
            ignoreList: ['rules/custom.mdc'],
        });

        mockReadConfigFile.mockResolvedValue(existingConfig);
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockGetLatestPromptsVersion).toHaveBeenCalled();
        expect(mockFetchPromptsTarball).toHaveBeenCalled();
        expect(mockCopyRulesToTarget).toHaveBeenCalled();
        expect(mockWriteConfigFile).toHaveBeenCalled();
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
        mockReadConfigFile.mockResolvedValue(null);
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockDeleteRulesFromTarget).toHaveBeenCalled();
        expect(mockCopyRulesToTarget).toHaveBeenCalled();
    });

    it('должен копировать правила через copyRulesToTarget', async () => {
        mockReadConfigFile.mockResolvedValue(null);
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockCopyRulesToTarget).toHaveBeenCalled();
    });

    it('должен записывать новую конфигурацию через writeConfigFile', async () => {
        mockReadConfigFile.mockResolvedValue(null);
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetLatestPromptsVersion.mockResolvedValue('2025.11.10.1');
        mockFetchPromptsTarball.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('3.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        await replaceAllCommand('/package/dir', '/target/dir');

        expect(mockWriteConfigFile).toHaveBeenCalled();

        const callArgs = mockWriteConfigFile.mock.calls[0];
        const config = callArgs[1];

        expect(config.cliVersion).toBe('3.0.0');
        expect(config.promptsVersion).toBe('2025.11.10.1');
        expect(config.installedAt).toBeTruthy();
        expect(config.updatedAt).toBeTruthy();
    });

    it('должен записывать корректный ISO timestamp в installedAt и updatedAt', async () => {
        mockReadConfigFile.mockResolvedValue(null);
        mockDeleteRulesFromTarget.mockResolvedValue(undefined);
        mockCopyRulesToTarget.mockResolvedValue(undefined);
        mockGetPackageVersion.mockResolvedValue('2.0.0');
        mockWriteConfigFile.mockResolvedValue(undefined);

        const beforeCall = new Date();
        await replaceAllCommand('/package/dir', '/target/dir');
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
