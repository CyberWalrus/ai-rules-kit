import { cancel, intro, isCancel, outro, select } from '@clack/prompts';

import { t } from '../../lib/i18n';
import type { InteractiveMenuAction } from '../../model/types/main';
import { configCommand } from '../commands/config';
import { initCommand } from '../commands/init';
import { replaceAllCommand } from '../commands/replace-all';
import { systemFilesCommand } from '../commands/system-files';
import { upgradeCommand } from '../commands/upgrade';
import { getPackageDir } from './get-package-dir';
import { getTargetDir } from './get-target-dir';

/** Показывает интерактивное меню выбора команды */
export async function showInteractiveMenu(currentFilePath: string): Promise<void> {
    intro(t('cli.interactive-menu.title'));

    const action = await select<InteractiveMenuAction>({
        message: t('cli.interactive-menu.select-action'),
        options: [
            { label: t('cli.interactive-menu.init'), value: 'init' },
            { label: t('cli.interactive-menu.upgrade'), value: 'upgrade' },
            { label: t('cli.interactive-menu.replace-all'), value: 'replace-all' },
            { label: t('cli.interactive-menu.config'), value: 'config' },
            { label: t('cli.interactive-menu.system-files'), value: 'system-files' },
            { label: t('cli.interactive-menu.exit'), value: 'exit' },
        ],
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

    const targetDir = getTargetDir();
    if (targetDir === null || targetDir === undefined) {
        throw new Error(t('cli.interactive-menu.target-dir-not-found'));
    }

    try {
        switch (action) {
            case 'init':
                await initCommand(packageDir, targetDir);
                outro(t('cli.main.init.success'));
                break;
            case 'upgrade':
                await upgradeCommand(packageDir, targetDir);
                outro(t('cli.main.upgrade.success'));
                break;
            case 'replace-all':
                await replaceAllCommand(packageDir, targetDir);
                outro(t('cli.main.replace-all.success'));
                break;
            case 'config':
                await configCommand();
                outro(t('cli.main.config.success'));
                break;
            case 'system-files':
                await systemFilesCommand();
                break;
        }
    } catch (error) {
        cancel(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
