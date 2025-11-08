import picocolors from 'picocolors';

import { compareVersions } from './compare-versions';
import { getNpmVersion } from './get-npm-version';

/** Проверяет и уведомляет о доступной новой версии */
export async function notifyIfUpdateAvailable(packageName: string, currentVersion: string): Promise<void> {
    try {
        const latestVersion = await getNpmVersion(packageName);
        const comparison = compareVersions(currentVersion, latestVersion);

        if (comparison.changeType === 'none') {
            return;
        }

        const { yellow, red, green, cyan, bold } = picocolors;

        console.log('');
        console.log(yellow('╭─────────────────────────────────────────────╮'));
        console.log(`${yellow('│')}  ${bold('Update available!')}                     ${yellow('│')}`);
        console.log(`${yellow('│')}                                           ${yellow('│')}`);
        console.log(
            `${yellow('│')}  ${red(currentVersion)} → ${green(latestVersion)}${' '.repeat(
                28 - currentVersion.length - latestVersion.length,
            )}${yellow('│')}`,
        );
        console.log(`${yellow('│')}                                           ${yellow('│')}`);
        console.log(`${yellow('│')}  Run ${cyan('npm i -g cursor-rules-cli@latest')} ${yellow('│')}`);
        console.log(`${yellow('│')}  or  ${cyan('yarn global add cursor-rules-cli')}  ${yellow('│')}`);
        console.log(yellow('╰─────────────────────────────────────────────╯'));
        console.log('');
    } catch {
        // Игнорируем ошибки - не критично
    }
}
