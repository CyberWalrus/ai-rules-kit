import { cancel, isCancel, log, outro, select } from '@clack/prompts';
import { fileURLToPath } from 'node:url';

import { readConfigFile } from '../../../lib/file-operations';
import { t } from '../../../lib/i18n';
import { getPackageVersion } from '../../../lib/version-manager/get-package-version';
import { getVersionsWithRetry } from '../../../lib/version-manager/get-versions-with-retry';
import { getPackageDir } from '../../main/get-package-dir';
import { getTargetDir } from '../../main/get-target-dir';

const currentFilePath = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);

/** Результат выполнения команды просмотра версий */
export type VersionsCommandResult = 'back-to-menu' | 'finish';

/** Команда просмотра версий */
export async function versionsCommand(): Promise<VersionsCommandResult> {
    const packageDir = getPackageDir(currentFilePath);
    if (packageDir === null || packageDir === undefined) {
        throw new Error('Package directory not found');
    }

    const targetDir = getTargetDir();
    const cliVersion = await getPackageVersion(packageDir);
    const config = targetDir !== null ? await readConfigFile(targetDir) : null;

    log.info('Версии компонентов:');
    log.info(`CLI: ${cliVersion}`);

    if (config !== null) {
        if (config.promptsVersion !== undefined) {
            log.info(`Prompts (установлено): ${config.promptsVersion}`);
        }
        if (config.systemRulesVersion !== undefined) {
            log.info(`System Rules (установлено): ${config.systemRulesVersion}`);
        }
    }

    const { promptsVersion, systemRulesVersion } = await getVersionsWithRetry();

    if (promptsVersion !== null) {
        log.info(`Prompts (доступно): ${promptsVersion}`);
    } else {
        log.warn('Не удалось получить версию Prompts из GitHub');
    }

    if (systemRulesVersion !== null) {
        log.info(`System Rules (доступно): ${systemRulesVersion}`);
    } else {
        log.warn('Не удалось получить версию System Rules из GitHub');
    }

    type VersionsAction = 'back-to-menu' | 'finish';

    const action = await select<VersionsAction>({
        message: t('command.versions.select-action'),
        options: [
            { label: t('command.versions.back-to-menu'), value: 'back-to-menu' },
            { label: t('command.versions.finish'), value: 'finish' },
        ],
    });

    if (isCancel(action)) {
        cancel(t('cli.interactive-menu.cancelled'));
        process.exit(0);
    }

    if (action === 'finish') {
        outro(t('cli.interactive-menu.goodbye'));

        return 'finish';
    }

    return 'back-to-menu';
}
