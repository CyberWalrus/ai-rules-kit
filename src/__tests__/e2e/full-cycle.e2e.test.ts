import { access, constants, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { initCommand } from '../../cli/commands/init/index';
import { replaceAllCommand } from '../../cli/commands/replace-all/index';
import { upgradeCommand } from '../../cli/commands/upgrade/index';
import type { RulesConfig } from '../../model';
import { VERSION_FILE_NAME } from '../../model';
import { tempDir } from './helpers/temp-dir';

vi.mock('../../lib/github-fetcher', () => ({
    fetchPromptsTarball: vi.fn(async (_repo: string, _version: string, targetDir: string) => {
        const { copyRulesFixtures } = await import('./helpers/copy-rules-fixtures');
        await copyRulesFixtures(targetDir);
    }),
    fetchSystemRulesTarball: vi.fn().mockResolvedValue(undefined),
    getLatestPromptsVersion: vi.fn().mockResolvedValue('2025.11.10.1'),
    getLatestSystemRulesVersion: vi.fn().mockResolvedValue(null),
}));

vi.mock('@clack/prompts', () => ({
    select: vi.fn().mockResolvedValue('cursor'),
}));

describe('Full Cycle E2E', () => {
    let tempDirPath: string;
    const packageDir = process.cwd();

    beforeAll(async () => {
        tempDirPath = await tempDir.create();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterAll(async () => {
        await tempDir.cleanup(tempDirPath);
    });

    it('должен выполнять полный цикл: init → upgrade → replace-all', { timeout: 30_000 }, async () => {
        await initCommand(packageDir, tempDirPath);

        const cursorDir = join(tempDirPath, '.cursor');
        const configFilePath = join(cursorDir, VERSION_FILE_NAME);

        await expect(access(cursorDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(configFilePath, constants.F_OK)).resolves.toBeUndefined();

        const configAfterInit = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        expect(configAfterInit).toHaveProperty('promptsVersion');
        expect(configAfterInit).toHaveProperty('installedAt');
        expect(configAfterInit).toHaveProperty('updatedAt');
        expect(configAfterInit).toHaveProperty('source', 'ai-rules-kit');
        expect(configAfterInit).toHaveProperty('configVersion', '1.0.0');

        const timestampAfterInit = new Date(configAfterInit.installedAt).getTime();

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await upgradeCommand(packageDir, tempDirPath);

        const configAfterUpdate = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;

        expect(configAfterUpdate.promptsVersion).toBe(configAfterInit.promptsVersion);

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await replaceAllCommand(packageDir, tempDirPath);

        const configAfterReplace = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        const timestampAfterReplace = new Date(configAfterReplace.updatedAt).getTime();

        expect(configAfterReplace.promptsVersion).toBe(configAfterInit.promptsVersion);
        expect(timestampAfterReplace).toBeGreaterThan(timestampAfterInit);

        await expect(access(cursorDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(configFilePath, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен корректно обновлять updatedAt на каждом шаге', async () => {
        const tempDir2: string = await tempDir.create();

        await initCommand(packageDir, tempDir2);
        const configFilePath: string = join(tempDir2, '.cursor', VERSION_FILE_NAME);

        const configAfterInit = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        const timestampUpdatedInit = new Date(configAfterInit.updatedAt).getTime();

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await upgradeCommand(packageDir, tempDir2);
        const configAfterUpdate = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        const timestampUpdatedUpdate = new Date(configAfterUpdate.updatedAt).getTime();

        expect(timestampUpdatedUpdate).toBe(timestampUpdatedInit);
        expect(configAfterUpdate.installedAt).toBe(configAfterInit.installedAt);

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await replaceAllCommand(packageDir, tempDir2);
        const configAfterReplace = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        const timestampUpdatedReplace = new Date(configAfterReplace.updatedAt).getTime();

        expect(timestampUpdatedReplace).toBeGreaterThan(timestampUpdatedUpdate);

        await tempDir.cleanup(tempDir2);
    });

    it('должен сохранять целостность файловой системы после всех операций', async () => {
        const tempDir3: string = await tempDir.create();

        await initCommand(packageDir, tempDir3);
        await upgradeCommand(packageDir, tempDir3);
        await replaceAllCommand(packageDir, tempDir3);

        const cursorRulesDir: string = join(tempDir3, '.cursor', 'rules');
        const cursorDocsDir: string = join(tempDir3, '.cursor', 'docs');
        const cursorCommandsDir: string = join(tempDir3, '.cursor', 'commands');
        const configFilePath: string = join(tempDir3, '.cursor', VERSION_FILE_NAME);

        await expect(access(cursorRulesDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(cursorDocsDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(cursorCommandsDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(configFilePath, constants.F_OK)).resolves.toBeUndefined();

        await tempDir.cleanup(tempDir3);
    });
});
