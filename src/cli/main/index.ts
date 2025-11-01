import { defineCommand, runMain } from 'citty';
import { fileURLToPath } from 'node:url';

import { initCommand } from '../commands/init/index';
import { replaceAllCommand } from '../commands/replace-all/index';
import { updateCommand } from '../commands/update/index';
import { getPackageDir } from './get-package-dir';

const currentFilePath = fileURLToPath(import.meta.url);
const packageDir = getPackageDir(currentFilePath);

/** Получает текущую рабочую директорию */
function getTargetDir(): string {
    return process.cwd();
}

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
                // eslint-disable-next-line no-console
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
                // eslint-disable-next-line no-console
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
                // eslint-disable-next-line no-console
                console.log('✅ Rules updated successfully');
            },
        }),
    },
});

/** Запускает CLI приложение */
export async function runCli(): Promise<void> {
    await runMain(main);
}
