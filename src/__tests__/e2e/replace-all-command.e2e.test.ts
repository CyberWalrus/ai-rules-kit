import { access, constants, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initCommand } from '../../cli/commands/init/index';
import { replaceAllCommand } from '../../cli/commands/replace-all/index';
import type { VersionInfo } from '../../model/types/main';
import { createVersionFile } from './helpers/create-version-file';
import { tempDir } from './helpers/temp-dir';

describe('Replace-All Command E2E', () => {
    let tempDirPathPath: string;
    const packageDir = process.cwd();

    beforeEach(async () => {
        tempDirPathPath = await tempDir.create();
    });

    afterEach(async () => {
        await tempDir.cleanup(tempDirPathPath);
    });

    it('должен успешно выполнять полную замену существующих правил', async () => {
        await initCommand(packageDir, tempDirPathPath);

        const versionFilePathBefore = join(tempDirPathPath, '.cursor-rules-version.json');
        const contentBefore = JSON.parse(await readFile(versionFilePathBefore, 'utf-8')) as VersionInfo;

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await replaceAllCommand(packageDir, tempDirPathPath);

        const versionFilePathAfter = join(tempDirPathPath, '.cursor-rules-version.json');
        const contentAfter = JSON.parse(await readFile(versionFilePathAfter, 'utf-8')) as VersionInfo;

        expect(contentAfter.version).toBe(contentBefore.version);
        expect(new Date(contentAfter.installedAt).getTime()).toBeGreaterThan(
            new Date(contentBefore.installedAt).getTime(),
        );
    });

    it('должен успешно выполнять замену даже если правила не инициализированы', async () => {
        await replaceAllCommand(packageDir, tempDirPathPath);

        const cursorDir = join(tempDirPathPath, '.cursor');
        const versionFilePath = join(tempDirPathPath, '.cursor-rules-version.json');

        await expect(access(cursorDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(versionFilePath, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен выбрасывать ошибку если package директория недоступна', async () => {
        const nonExistentDir = join(tempDirPathPath, 'non-existent-package');

        await expect(replaceAllCommand(nonExistentDir, tempDirPathPath)).rejects.toThrow();
    });

    it('должен создавать новый version файл после замены', async () => {
        await createVersionFile(tempDirPathPath, '0.0.1');

        await replaceAllCommand(packageDir, tempDirPathPath);

        const versionFilePath = join(tempDirPathPath, '.cursor-rules-version.json');
        const content = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;

        expect(content).toHaveProperty('version');
        expect(content).toHaveProperty('installedAt');
        expect(content).toHaveProperty('source', 'cursor-rules');
        expect(content.version).not.toBe('0.0.1');
    });

    it('должен копировать все необходимые директории', async () => {
        await replaceAllCommand(packageDir, tempDirPathPath);

        const cursorDir = join(tempDirPathPath, '.cursor');
        const userRulesDir = join(tempDirPathPath, 'user-rules');

        await expect(access(cursorDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(userRulesDir, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен обновлять timestamp при замене', async () => {
        await createVersionFile(tempDirPathPath, '0.0.1');

        const versionFilePath = join(tempDirPathPath, '.cursor-rules-version.json');
        const contentBefore = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;
        const timestampBefore = new Date(contentBefore.installedAt).getTime();

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await replaceAllCommand(packageDir, tempDirPathPath);

        const contentAfter = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;
        const timestampAfter = new Date(contentAfter.installedAt).getTime();

        expect(timestampAfter).toBeGreaterThan(timestampBefore);
    });
});
