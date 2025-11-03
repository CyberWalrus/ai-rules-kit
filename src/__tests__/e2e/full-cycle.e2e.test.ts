import { access, constants, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { initCommand } from '../../cli/commands/init/index';
import { replaceAllCommand } from '../../cli/commands/replace-all/index';
import { updateCommand } from '../../cli/commands/update/index';
import type { VersionInfo } from '../../model/types/main';
import { tempDir } from './helpers/temp-dir';

describe('Full Cycle E2E', () => {
    let tempDirPath: string;
    const packageDir = process.cwd();

    beforeAll(async () => {
        tempDirPath = await tempDir.create();
    });

    afterAll(async () => {
        await tempDir.cleanup(tempDirPath);
    });

    it('должен выполнять полный цикл: init → update → replace-all', async () => {
        await initCommand(packageDir, tempDirPath);

        const cursorDir = join(tempDirPath, '.cursor');
        const versionFilePath = join(tempDirPath, '.cursor-rules-version.json');

        await expect(access(cursorDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(versionFilePath, constants.F_OK)).resolves.toBeUndefined();

        const versionAfterInit = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;
        expect(versionAfterInit).toHaveProperty('version');
        expect(versionAfterInit).toHaveProperty('installedAt');
        expect(versionAfterInit).toHaveProperty('source', 'cursor-rules');

        const timestampAfterInit = new Date(versionAfterInit.installedAt).getTime();

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await updateCommand(packageDir, tempDirPath);

        const versionAfterUpdate = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;

        expect(versionAfterUpdate.version).toBe(versionAfterInit.version);

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await replaceAllCommand(packageDir, tempDirPath);

        const versionAfterReplace = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;
        const timestampAfterReplace = new Date(versionAfterReplace.installedAt).getTime();

        expect(versionAfterReplace.version).toBe(versionAfterInit.version);
        expect(timestampAfterReplace).toBeGreaterThan(timestampAfterInit);

        await expect(access(cursorDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(versionFilePath, constants.F_OK)).resolves.toBeUndefined();
    });

    it('должен корректно обновлять timestamp на каждом шаге', async () => {
        const tempDir2: string = await tempDir.create();

        await initCommand(packageDir, tempDir2);
        const versionFilePath: string = join(tempDir2, '.cursor-rules-version.json');

        const versionAfterInit = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;
        const timestampInit = new Date(versionAfterInit.installedAt).getTime();

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await updateCommand(packageDir, tempDir2);
        const versionAfterUpdate = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;
        const timestampUpdate = new Date(versionAfterUpdate.installedAt).getTime();

        expect(timestampUpdate).toBe(timestampInit);

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await replaceAllCommand(packageDir, tempDir2);
        const versionAfterReplace = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;
        const timestampReplace = new Date(versionAfterReplace.installedAt).getTime();

        expect(timestampReplace).toBeGreaterThan(timestampUpdate);

        await tempDir.cleanup(tempDir2);
    });

    it('должен сохранять целостность файловой системы после всех операций', async () => {
        const tempDir3: string = await tempDir.create();

        await initCommand(packageDir, tempDir3);
        await updateCommand(packageDir, tempDir3);
        await replaceAllCommand(packageDir, tempDir3);

        const cursorRulesDir: string = join(tempDir3, '.cursor', 'rules');
        const cursorDocsDir: string = join(tempDir3, '.cursor', 'docs');
        const cursorCommandsDir: string = join(tempDir3, '.cursor', 'commands');
        const versionFilePath: string = join(tempDir3, '.cursor-rules-version.json');

        await expect(access(cursorRulesDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(cursorDocsDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(cursorCommandsDir, constants.F_OK)).resolves.toBeUndefined();
        await expect(access(versionFilePath, constants.F_OK)).resolves.toBeUndefined();

        await tempDir.cleanup(tempDir3);
    });
});
