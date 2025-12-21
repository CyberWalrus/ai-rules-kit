import { platform } from 'node:os';
import { join } from 'node:path';

import { pathExists } from '../file-operations/path-exists';
import { isEmptyString } from '../helpers';

/** Определяет базовую директорию конфигурации Cursor */
// eslint-disable-next-line sonarjs/cognitive-complexity
export async function getCursorConfigDir(): Promise<string> {
    const osPlatform = platform();
    let configDir: string | null = null;

    if (osPlatform === 'win32') {
        const appData = process.env.APPDATA;

        if (appData === null || appData === undefined || isEmptyString(appData)) {
            throw new Error('APPDATA environment variable is not set');
        }

        const standardPath = join(appData, 'Cursor');
        const altPath = join(process.env.USERPROFILE ?? '', '.cursor');

        if (await pathExists(standardPath)) {
            configDir = standardPath;
        } else if (await pathExists(altPath)) {
            configDir = altPath;
        } else {
            configDir = standardPath;
        }
    } else if (osPlatform === 'darwin') {
        const home = process.env.HOME;

        if (home === null || home === undefined || isEmptyString(home)) {
            throw new Error('HOME environment variable is not set');
        }

        const standardPath = join(home, 'Library', 'Application Support', 'Cursor');
        const altPath = join(home, '.cursor');

        if (await pathExists(standardPath)) {
            configDir = standardPath;
        } else if (await pathExists(altPath)) {
            configDir = altPath;
        } else {
            configDir = standardPath;
        }
    } else {
        const xdgConfigHome = process.env.XDG_CONFIG_HOME;
        const home = process.env.HOME;

        if (home === null || home === undefined || isEmptyString(home)) {
            throw new Error('HOME environment variable is not set');
        }

        const standardPath =
            xdgConfigHome !== null && xdgConfigHome !== undefined && !isEmptyString(xdgConfigHome)
                ? join(xdgConfigHome, 'cursor')
                : join(home, '.cursor');
        const altPath = join(home, '.cursor');

        if (await pathExists(standardPath)) {
            configDir = standardPath;
        } else if (await pathExists(altPath)) {
            configDir = altPath;
        } else {
            configDir = standardPath;
        }
    }

    if (configDir === null) {
        throw new Error('Failed to determine Cursor config directory');
    }

    return configDir;
}
