import { access, constants } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initCommand } from '../../cli/commands/init/index';
import { VERSION_FILE_NAME } from '../../model';
import { createVersionFile } from './helpers/create-version-file';
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
    isCancel: vi.fn((value) => value === 'cancel'),
    select: vi.fn(),
}));

describe('Init Command E2E', () => {
    let tempDirPath: string;
    const packageDir = process.cwd();

    beforeEach(async () => {
        vi.clearAllMocks();
        // Мокаем select для выбора IDE в тестах
        const { select } = await import('@clack/prompts');
        vi.mocked(select).mockResolvedValue('cursor');
        tempDirPath = await tempDir.create();
    });

    afterEach(async () => {
        await tempDir.cleanup(tempDirPath);
    });

    it('должен выбрасывать ошибку при инициализации если правила уже установлены', async () => {
        await createVersionFile(tempDirPath, '2025.11.9.1');

        await expect(initCommand(packageDir, tempDirPath)).rejects.toThrow('Rules already initialized with version');
    });

    it('должен выбрасывать ошибку если package директория не существует', async () => {
        const nonExistentDir = join(tempDirPath, 'non-existent-package');

        await expect(initCommand(nonExistentDir, tempDirPath)).rejects.toThrow();
    });

    it('должен создавать .cursor/cursor-rules-config.json файл', async () => {
        await initCommand(packageDir, tempDirPath);

        const configFilePath = join(tempDirPath, '.cursor', VERSION_FILE_NAME);

        await expect(access(configFilePath, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен копировать .cursor директорию', async () => {
        await initCommand(packageDir, tempDirPath);

        const cursorDir = join(tempDirPath, '.cursor');

        await expect(access(cursorDir, constants.F_OK)).resolves.toBeUndefined();
    });
});
