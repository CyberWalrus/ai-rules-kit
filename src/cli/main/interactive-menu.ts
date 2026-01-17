import { cancel, intro, isCancel, outro, select } from '@clack/prompts';

import { t } from '../../lib/i18n';
import { getUninitializedIdes } from '../../lib/ide-config';
import { getCurrentVersion } from '../../lib/version-manager/get-current-version';
import type { InteractiveMenuAction } from '../../model/types/main';
import { configCommand } from '../commands/config';
import { initCommand } from '../commands/init';
import { resetCommand } from '../commands/reset';
import { systemFilesCommand } from '../commands/system-files';
import { upgradeCommand } from '../commands/upgrade';
import { versionsCommand } from '../commands/versions';
import { getPackageDir } from './get-package-dir';
import { getTargetDir } from './get-target-dir';

/** Создает список опций для меню */
function buildMenuOptions(
    isInitialized: boolean,
    hasUninitializedIdes: boolean,
): Array<{ label: string; value: InteractiveMenuAction; hint?: string }> {
    const options: Array<{ label: string; value: InteractiveMenuAction; hint?: string }> = [];

    if (!isInitialized) {
        options.push({
            hint: t('cli.interactive-menu.init.hint'),
            label: t('cli.interactive-menu.init'),
            value: 'init',
        });
    }

    if (isInitialized) {
        options.push({
            hint: t('cli.interactive-menu.upgrade.hint'),
            label: t('cli.interactive-menu.upgrade'),
            value: 'upgrade',
        });
    }

    if (isInitialized) {
        options.push({
            hint: t('cli.interactive-menu.reset.hint'),
            label: t('cli.interactive-menu.reset'),
            value: 'reset',
        });
    }

    if (isInitialized && hasUninitializedIdes) {
        options.push({
            hint: t('cli.interactive-menu.init-other-ide.hint'),
            label: t('cli.interactive-menu.init-other-ide'),
            value: 'init-other-ide',
        });
    }

    options.push(
        {
            hint: t('cli.interactive-menu.system-files.hint'),
            label: t('cli.interactive-menu.system-files'),
            value: 'system-files',
        },
        { hint: t('cli.interactive-menu.config.hint'), label: t('cli.interactive-menu.config'), value: 'config' },
        {
            hint: t('cli.interactive-menu.versions.hint'),
            label: t('cli.interactive-menu.versions'),
            value: 'versions',
        },
        { label: t('cli.interactive-menu.finish'), value: 'exit' },
    );

    return options;
}

/** Обрабатывает выбранное действие */
async function handleMenuAction(
    action: InteractiveMenuAction,
    packageDir: string,
    targetDir: string,
): Promise<boolean> {
    switch (action) {
        case 'init':
        case 'init-other-ide':
            await initCommand(packageDir, targetDir);
            outro(t('cli.main.init.success'));

            return false;
        case 'upgrade':
            await upgradeCommand(packageDir, targetDir);
            outro(t('cli.main.upgrade.success'));

            return false;
        case 'reset':
            await resetCommand(packageDir, targetDir);

            return false;
        case 'config': {
            const result = await configCommand();

            return result === 'finish';
        }
        case 'system-files': {
            const result = await systemFilesCommand();

            return result === 'finish';
        }
        case 'versions': {
            const result = await versionsCommand();

            return result === 'finish';
        }
        default:
            return false;
    }
}

/** Показывает интерактивное меню выбора команды */
export async function showInteractiveMenu(currentFilePath: string): Promise<void> {
    intro(t('cli.interactive-menu.title'));

    while (true) {
        const targetDir = getTargetDir();
        if (targetDir === null || targetDir === undefined) {
            throw new Error(t('cli.interactive-menu.target-dir-not-found'));
        }

        const currentVersion = await getCurrentVersion(targetDir);
        const isInitialized = currentVersion !== null;
        const uninitializedIdes = await getUninitializedIdes(targetDir);
        const hasUninitializedIdes = uninitializedIdes.length > 0;
        const options = buildMenuOptions(isInitialized, hasUninitializedIdes);

        const action = await select<InteractiveMenuAction>({
            message: t('cli.interactive-menu.select-action'),
            options,
        });

        if (isCancel(action)) {
            cancel(t('cli.interactive-menu.cancelled'));
            process.exit(0);
        }

        if (action === 'exit') {
            outro(t('cli.interactive-menu.goodbye'));

            return;
        }

        const packageDir = getPackageDir(currentFilePath);
        if (packageDir === null || packageDir === undefined) {
            throw new Error(t('cli.main.package-dir-not-found'));
        }

        try {
            const shouldExit = await handleMenuAction(action, packageDir, targetDir);
            if (shouldExit) {
                return;
            }
        } catch (error) {
            cancel(error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    }
}
