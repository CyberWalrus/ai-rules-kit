import { access, constants, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initCommand } from '../../cli/commands/init/index';
import { replaceAllCommand } from '../../cli/commands/replace-all/index';
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
    isCancel: vi.fn((value) => value === 'cancel'),
    select: vi.fn(),
}));

describe('Replace-All Command E2E', () => {
    let tempDirPathPath: string;
    const packageDir = process.cwd();

    beforeEach(async () => {
        vi.clearAllMocks();
        // Мокаем select для выбора IDE в тестах
        const { select } = await import('@clack/prompts');
        vi.mocked(select).mockResolvedValue('cursor');
        tempDirPathPath = await tempDir.create();
    });

    afterEach(async () => {
        await tempDir.cleanup(tempDirPathPath);
    });

    it('должен успешно выполнять полную замену существующих правил', { timeout: 30_000 }, async () => {
        await initCommand(packageDir, tempDirPathPath);

        const configFilePathBefore = join(tempDirPathPath, '.cursor', VERSION_FILE_NAME);
        const contentBefore = JSON.parse(await readFile(configFilePathBefore, 'utf-8')) as RulesConfig;

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await replaceAllCommand(packageDir, tempDirPathPath);

        const configFilePathAfter = join(tempDirPathPath, '.cursor', VERSION_FILE_NAME);
        const contentAfter = JSON.parse(await readFile(configFilePathAfter, 'utf-8')) as RulesConfig;

        expect(contentAfter.promptsVersion).toBe(contentBefore.promptsVersion);
        expect(new Date(contentAfter.updatedAt).getTime()).toBeGreaterThan(new Date(contentBefore.updatedAt).getTime());
    });

    it('должен успешно выполнять замену даже если правила не инициализированы', async () => {
        await replaceAllCommand(packageDir, tempDirPathPath);

        const cursorDir = join(tempDirPathPath, '.cursor');
        const configFilePath = join(cursorDir, VERSION_FILE_NAME);

        await expect(access(cursorDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(configFilePath, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен выбрасывать ошибку если package директория недоступна', async () => {
        const nonExistentDir = join(tempDirPathPath, 'non-existent-package');

        await expect(replaceAllCommand(nonExistentDir, tempDirPathPath)).rejects.toThrow();
    });

    it('должен создавать новый config файл после замены', async () => {
        await copyRulesFixtures(tempDirPathPath);
        await createVersionFile(tempDirPathPath, '2025.11.9.1');

        await replaceAllCommand(packageDir, tempDirPathPath);

        const configFilePath = join(tempDirPathPath, '.cursor', VERSION_FILE_NAME);
        const content = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;

        expect(content).toHaveProperty('promptsVersion');
        expect(content).toHaveProperty('installedAt');
        expect(content).toHaveProperty('updatedAt');
        expect(content).toHaveProperty('source', 'ai-rules-kit');
        expect(content).toHaveProperty('configVersion', '1.0.0');
        expect(content.promptsVersion).not.toBe('2025.11.9.1');
    });

    it('должен копировать все необходимые директории', async () => {
        await replaceAllCommand(packageDir, tempDirPathPath);

        const cursorDir = join(tempDirPathPath, '.cursor');

        await expect(access(cursorDir, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен обновлять updatedAt при замене', async () => {
        await copyRulesFixtures(tempDirPathPath);
        await createVersionFile(tempDirPathPath, '2025.11.9.1');

        const configFilePath = join(tempDirPathPath, '.cursor', VERSION_FILE_NAME);
        const contentBefore = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        const timestampBefore = new Date(contentBefore.updatedAt).getTime();

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await replaceAllCommand(packageDir, tempDirPathPath);

        const contentAfter = JSON.parse(await readFile(configFilePath, 'utf-8')) as RulesConfig;
        const timestampAfter = new Date(contentAfter.updatedAt).getTime();

        expect(timestampAfter).toBeGreaterThan(timestampBefore);
    });
});
