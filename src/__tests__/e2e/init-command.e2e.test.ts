import { access, constants } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initCommand } from '../../cli/commands/init/index';
import { createVersionFile } from './helpers/copy-fixtures';
import { cleanupTempDir, createTempDir } from './helpers/temp-dir';

describe('Init Command E2E', () => {
    let tempDir: string;
    const packageDir = process.cwd();

    beforeEach(async () => {
        tempDir = await createTempDir();
    });

    afterEach(async () => {
        await cleanupTempDir(tempDir);
    });

    it('должен выбрасывать ошибку при инициализации если правила уже установлены', async () => {
        await createVersionFile(tempDir, '1.0.0');

        await expect(initCommand(packageDir, tempDir)).rejects.toThrow('Rules already initialized with version 1.0.0');
    });

    it('должен выбрасывать ошибку если package директория не существует', async () => {
        const nonExistentDir = join(tempDir, 'non-existent-package');

        await expect(initCommand(nonExistentDir, tempDir)).rejects.toThrow();
    });

    it('должен создавать .cursor-rules-version.json файл', async () => {
        await initCommand(packageDir, tempDir);

        const versionFilePath = join(tempDir, '.cursor-rules-version.json');

        await expect(access(versionFilePath, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен копировать .cursor директорию', async () => {
        await initCommand(packageDir, tempDir);

        const cursorDir = join(tempDir, '.cursor');

        await expect(access(cursorDir, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен копировать user-rules директорию', async () => {
        await initCommand(packageDir, tempDir);

        const userRulesDir = join(tempDir, 'user-rules');

        await expect(access(userRulesDir, constants.F_OK)).resolves.toBeUndefined();
    });
});
