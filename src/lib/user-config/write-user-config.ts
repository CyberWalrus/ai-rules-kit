import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { USER_CONFIG_FILE_NAME } from '../../model/constants/main';
import type { UserConfig } from '../../model/types/main';
import { getUserConfigDir } from './get-user-config-dir';

/** Записывает глобальную конфигурацию пользователя */
export async function writeUserConfig(config: UserConfig): Promise<void> {
    if (config === null || config === undefined) {
        throw new Error('config is required');
    }

    const configDir = getUserConfigDir();
    const configFilePath = join(configDir, USER_CONFIG_FILE_NAME);
    const content = JSON.stringify(config, null, 2);

    try {
        await mkdir(configDir, { recursive: true });
        await writeFile(configFilePath, content, 'utf8');
    } catch (error) {
        throw new Error(`Failed to write user config file: ${String(error)}`);
    }
}
