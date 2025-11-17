import { bold, cyan, green, red } from 'picocolors';

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

        console.log('');
        console.log(`${bold('Update available!')}`);
        console.log(`${red(currentVersion)} → ${green(latestVersion)}`);
        console.log(`Run ${cyan('npm i -g cursor-rules-cli@latest')}`);
        console.log(`or  ${cyan('yarn global add cursor-rules-cli')}`);
        console.log('');
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.debug('Failed to notify about update:', err);
        }
    }
}
