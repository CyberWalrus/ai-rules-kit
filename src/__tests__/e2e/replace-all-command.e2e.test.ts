import { access, constants, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initCommand } from '../../cli/commands/init/index';
import { replaceAllCommand } from '../../cli/commands/replace-all/index';
import type { VersionInfo } from '../../model/types/main';
import { createVersionFile } from './helpers/copy-fixtures';
import { cleanupTempDir, createTempDir } from './helpers/temp-dir';

describe('Replace-All Command E2E', () => {
    let tempDir: string;
    const packageDir = process.cwd();

    beforeEach(async () => {
        tempDir = await createTempDir();
    });

    afterEach(async () => {
        await cleanupTempDir(tempDir);
    });

    it('должен успешно выполнять полную замену существующих правил', async () => {
        await initCommand(packageDir, tempDir);

        const versionFilePathBefore = join(tempDir, '.cursor-rules-version.json');
        const contentBefore = JSON.parse(await readFile(versionFilePathBefore, 'utf-8')) as VersionInfo;

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await replaceAllCommand(packageDir, tempDir);

        const versionFilePathAfter = join(tempDir, '.cursor-rules-version.json');
        const contentAfter = JSON.parse(await readFile(versionFilePathAfter, 'utf-8')) as VersionInfo;

        expect(contentAfter.version).toBe(contentBefore.version);
        expect(new Date(contentAfter.installedAt).getTime()).toBeGreaterThan(
            new Date(contentBefore.installedAt).getTime(),
        );
    });

    it('должен успешно выполнять замену даже если правила не инициализированы', async () => {
        await replaceAllCommand(packageDir, tempDir);

        const cursorDir = join(tempDir, '.cursor');
        const versionFilePath = join(tempDir, '.cursor-rules-version.json');

        await expect(access(cursorDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(versionFilePath, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен выбрасывать ошибку если package директория недоступна', async () => {
        const nonExistentDir = join(tempDir, 'non-existent-package');

        await expect(replaceAllCommand(nonExistentDir, tempDir)).rejects.toThrow();
    });

    it('должен создавать новый version файл после замены', async () => {
        await createVersionFile(tempDir, '0.0.1');

        await replaceAllCommand(packageDir, tempDir);

        const versionFilePath = join(tempDir, '.cursor-rules-version.json');
        const content = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;

        expect(content).toHaveProperty('version');
        expect(content).toHaveProperty('installedAt');
        expect(content).toHaveProperty('source', 'cursor-rules');
        expect(content.version).not.toBe('0.0.1');
    });

    it('должен копировать все необходимые директории', async () => {
        await replaceAllCommand(packageDir, tempDir);

        const cursorDir = join(tempDir, '.cursor');
        const userRulesDir = join(tempDir, 'user-rules');

        await expect(access(cursorDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(userRulesDir, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен обновлять timestamp при замене', async () => {
        await createVersionFile(tempDir, '0.0.1');

        const versionFilePath = join(tempDir, '.cursor-rules-version.json');
        const contentBefore = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;
        const timestampBefore = new Date(contentBefore.installedAt).getTime();

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await replaceAllCommand(packageDir, tempDir);

        const contentAfter = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;
        const timestampAfter = new Date(contentAfter.installedAt).getTime();

        expect(timestampAfter).toBeGreaterThan(timestampBefore);
    });
});
