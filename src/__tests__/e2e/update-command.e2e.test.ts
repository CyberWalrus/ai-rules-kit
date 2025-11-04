import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initCommand } from '../../cli/commands/init/index';
import { updateCommand } from '../../cli/commands/update/index';
import type { VersionInfo } from '../../model/types/main';
import { createVersionFile } from './helpers/create-version-file';
import { tempDir } from './helpers/temp-dir';

describe('Update Command E2E', () => {
    let tempDirPathPath: string;
    const packageDir = process.cwd();

    beforeEach(async () => {
        tempDirPathPath = await tempDir.create();
    });

    afterEach(async () => {
        await tempDir.cleanup(tempDirPathPath);
    });

    it('должен выбрасывать ошибку если правила не инициализированы', async () => {
        await expect(updateCommand(packageDir, tempDirPathPath)).rejects.toThrow(
            'Rules not initialized. Run init command first.',
        );
    });

    it('должен пропускать обновление если версии идентичны', async () => {
        await initCommand(packageDir, tempDirPathPath);

        const versionFilePath = join(tempDirPathPath, '.cursor', 'rules-version.json');
        const versionBeforeUpdate = await readFile(versionFilePath, 'utf-8');

        await updateCommand(packageDir, tempDirPathPath);

        const versionAfterUpdate = await readFile(versionFilePath, 'utf-8');

        expect(versionBeforeUpdate).toBe(versionAfterUpdate);
    });

    it('должен успешно обновлять при наличии diff', async () => {
        await createVersionFile(tempDirPathPath, '0.0.1');

        const versionFilePathBefore = join(tempDirPathPath, '.cursor', 'rules-version.json');
        const contentBefore = JSON.parse(await readFile(versionFilePathBefore, 'utf-8')) as VersionInfo;

        await updateCommand(packageDir, tempDirPathPath);

        const versionFilePathAfter = join(tempDirPathPath, '.cursor', 'rules-version.json');
        const contentAfter = JSON.parse(await readFile(versionFilePathAfter, 'utf-8')) as VersionInfo;

        expect(contentAfter.version).not.toBe(contentBefore.version);
        expect(contentAfter.installedAt).not.toBe(contentBefore.installedAt);
    });

    it('должен обновлять timestamp при обновлении', async () => {
        await createVersionFile(tempDirPathPath, '0.0.1');

        const versionFilePath = join(tempDirPathPath, '.cursor', 'rules-version.json');
        const contentBefore = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;
        const timestampBefore = new Date(contentBefore.installedAt).getTime();

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 10);
        });

        await updateCommand(packageDir, tempDirPathPath);

        const contentAfter = JSON.parse(await readFile(versionFilePath, 'utf-8')) as VersionInfo;
        const timestampAfter = new Date(contentAfter.installedAt).getTime();

        expect(timestampAfter).toBeGreaterThan(timestampBefore);
    });
});
