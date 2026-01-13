import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initCommand } from '../../cli/commands/init/index';
import { upgradeCommand } from '../../cli/commands/upgrade/index';
import { pathExists } from '../../lib/file-operations/path-exists';
import type { RulesConfig } from '../../model';
import { VERSION_FILE_NAME } from '../../model';
import { copyRulesFixtures } from './helpers/copy-rules-fixtures';
import { createVersionFile } from './helpers/create-version-file';
import { tempDir } from './helpers/temp-dir';

vi.mock('../../lib/github-fetcher', () => ({
    fetchPromptsTarball: vi.fn(async (_repo: string, _version: string, targetDir: string) => {
        const { copyRulesFixtures: copyFixtures } = await import('./helpers/copy-rules-fixtures');
        await copyFixtures(targetDir);
    }),
    fetchSystemRulesTarball: vi.fn().mockResolvedValue(undefined),
    getLatestPromptsVersion: vi.fn().mockResolvedValue('2025.11.10.1'),
    getLatestSystemRulesVersion: vi.fn().mockResolvedValue(null),
}));

vi.mock('@clack/prompts', () => ({
    select: vi.fn().mockResolvedValue('cursor'),
}));

describe('Upgrade Command E2E', () => {
    let tempDirPathPath: string;
    const packageDir = process.cwd();

    beforeEach(async () => {
        vi.clearAllMocks();
        tempDirPathPath = await tempDir.create();
    });

    afterEach(async () => {
        await tempDir.cleanup(tempDirPathPath);
    });

    it('должен выбрасывать ошибку если правила не инициализированы', async () => {
        await expect(upgradeCommand(packageDir, tempDirPathPath)).rejects.toThrow(
            'Rules not initialized. Run init command first.',
        );
    });

    it('должен пропускать обновление если версии идентичны', { timeout: 30_000 }, async () => {
        await initCommand(packageDir, tempDirPathPath);

        const configFilePath = join(tempDirPathPath, '.cursor', VERSION_FILE_NAME);
        const configBeforeUpdate = await readFile(configFilePath, 'utf-8');

        await upgradeCommand(packageDir, tempDirPathPath);

        const configAfterUpdate = await readFile(configFilePath, 'utf-8');

        expect(configBeforeUpdate).toBe(configAfterUpdate);
    });

    it('должен успешно обновлять при наличии diff', { timeout: 30_000 }, async () => {
        await copyRulesFixtures(tempDirPathPath);
        await createVersionFile(tempDirPathPath, '2025.11.9.1');

        const configFilePathBefore = join(tempDirPathPath, '.cursor', VERSION_FILE_NAME);
        const contentBefore = JSON.parse(await readFile(configFilePathBefore, 'utf-8')) as RulesConfig;

        await upgradeCommand(packageDir, tempDirPathPath);

        const configFilePathAfter = join(tempDirPathPath, '.cursor', VERSION_FILE_NAME);
        const contentAfter = JSON.parse(await readFile(configFilePathAfter, 'utf-8')) as RulesConfig;

        expect(contentAfter.promptsVersion).not.toBe(contentBefore.promptsVersion);
        expect(contentAfter.updatedAt).not.toBe(contentBefore.updatedAt);
    });

    it('должен обновлять updatedAt при обновлении', { timeout: 30_000 }, async () => {
        await copyRulesFixtures(tempDirPathPath);
        await createVersionFile(tempDirPathPath, '2025.11.9.1');

        const configFilePath = join(tempDirPathPath, '.cursor', VERSION_FILE_NAME);
        const contentBefore = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        const timestampBefore = new Date(contentBefore.updatedAt).getTime();

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await upgradeCommand(packageDir, tempDirPathPath);

        const contentAfter = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        const timestampAfter = new Date(contentAfter.updatedAt).getTime();

        expect(timestampAfter).toBeGreaterThan(timestampBefore);
    });

    it('должен добавлять файлы исключённые отрицательными паттернами при обновлении', { skip: true }, async () => {
        const currentTimestamp = new Date().toISOString();
        const config: RulesConfig = {
            cliVersion: '1.0.0',
            configVersion: '1.0.0',
            fileOverrides: [],
            ideType: 'cursor',
            ignoreList: ['rules/**', '!rules/prompt-workflow.mdc'],
            installedAt: currentTimestamp,
            promptsVersion: '2025.11.9.1',
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: 'ru',
            },
            source: 'ai-rules-kit',
            systemRulesVersion: undefined,
            updatedAt: currentTimestamp,
        };

        const cursorDir = join(tempDirPathPath, '.cursor');
        const configFilePath = join(cursorDir, VERSION_FILE_NAME);
        const rulesDir = join(cursorDir, 'rules');
        const promptWorkflowPath = join(rulesDir, 'prompt-workflow.mdc');

        await mkdir(cursorDir, { recursive: true });
        await writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf-8');

        if (await pathExists(promptWorkflowPath)) {
            await rm(promptWorkflowPath);
        }

        const promptWorkflowExistsBefore = await pathExists(promptWorkflowPath);

        expect(promptWorkflowExistsBefore).toBe(false);

        await upgradeCommand(packageDir, tempDirPathPath);

        const promptWorkflowExistsAfter = await pathExists(promptWorkflowPath);

        expect(promptWorkflowExistsAfter).toBe(true);
    });
});
