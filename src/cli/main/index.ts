import { defineCommand, runMain } from 'citty';
import { fileURLToPath } from 'node:url';

import { initCommand } from '../commands/init/index';
import { replaceAllCommand } from '../commands/replace-all/index';
import { updateCommand } from '../commands/update/index';
import { ensureLatestVersion } from './ensure-latest-version';
import { getPackageDir } from './get-package-dir';
import { getTargetDir } from './get-target-dir';

const currentFilePath = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const packageDir = getPackageDir(currentFilePath);

/** Главная команда CLI */
const main = defineCommand({
    meta: {
        description: 'CLI tool for managing .cursor rules in projects',
        name: 'cursor-rules',
        version: '0.1.3',
    },
    subCommands: {
        init: defineCommand({
            meta: {
                description: 'Initialize .cursor rules in the project',
                name: 'init',
            },
            /** Запускает инициализацию .cursor правил */
            async run(): Promise<void> {
                const targetDir = getTargetDir();
                await initCommand(packageDir, targetDir);
                console.log('✅ Rules initialized successfully');
            },
        }),
        'replace-all': defineCommand({
            meta: {
                description: 'Replace all .cursor rules with the latest version',
                name: 'replace-all',
            },
            /** Запускает полную замену .cursor правил */
            async run(): Promise<void> {
                const targetDir = getTargetDir();
                await replaceAllCommand(packageDir, targetDir);
                console.log('✅ Rules replaced successfully');
            },
        }),
        update: defineCommand({
            meta: {
                description: 'Update .cursor rules to the latest version',
                name: 'update',
            },
            /** Запускает обновление .cursor правил */
            async run(): Promise<void> {
                const targetDir = getTargetDir();
                await updateCommand(packageDir, targetDir);
                console.log('✅ Rules updated successfully');
            },
        }),
    },
});

/** Запускает CLI приложение */
export async function runCli(): Promise<void> {
    if (packageDir === null || packageDir === undefined) {
        throw new Error('Package directory not found');
    }

    ensureLatestVersion(packageDir).catch((error) => {
        const message: string = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ Failed to check for updates: ${message}`);
    });

    await runMain(main);
}
