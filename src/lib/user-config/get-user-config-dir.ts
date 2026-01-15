import { platform } from 'node:os';
import { join } from 'node:path';

import { isEmptyString } from '../helpers';

/** Определяет директорию для хранения глобальной конфигурации пользователя */
export function getUserConfigDir(): string {
    const osPlatform = platform();
    let configDir: string;

    if (osPlatform === 'win32') {
        const appData = process.env.APPDATA;

        if (appData === null || appData === undefined || isEmptyString(appData)) {
            throw new Error('APPDATA environment variable is not set');
        }

        configDir = join(appData, 'ai-rules-kit');
    } else if (osPlatform === 'darwin') {
        const home = process.env.HOME;

        if (home === null || home === undefined || isEmptyString(home)) {
            throw new Error('HOME environment variable is not set');
        }

        configDir = join(home, 'Library', 'Preferences', 'ai-rules-kit');
    } else {
        const xdgConfigHome = process.env.XDG_CONFIG_HOME;
        const home = process.env.HOME;

        if (home === null || home === undefined || isEmptyString(home)) {
            throw new Error('HOME environment variable is not set');
        }

        if (xdgConfigHome !== null && xdgConfigHome !== undefined && !isEmptyString(xdgConfigHome)) {
            configDir = join(xdgConfigHome, 'ai-rules-kit');
        } else {
            configDir = join(home, '.config', 'ai-rules-kit');
        }
    }

    return configDir;
}
