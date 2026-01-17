import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { USER_CONFIG_FILE_NAME } from '../../model/constants/main';
import { userConfigSchema } from '../../model/schemas/main';
import type { UserConfig } from '../../model/types/main';
import { pathExists } from '../file-operations/path-exists';
import { getUserConfigDir } from './get-user-config-dir';

/** Читает глобальную конфигурацию пользователя */
export async function readUserConfig(): Promise<UserConfig | null> {
    try {
        const configDir = getUserConfigDir();
        const configFilePath = join(configDir, USER_CONFIG_FILE_NAME);
        const fileExists = await pathExists(configFilePath);

        if (fileExists === false) {
            return null;
        }

        const content = await readFile(configFilePath, 'utf8');
        const parsed = JSON.parse(content) as unknown;

        return userConfigSchema.parse(parsed);
    } catch {
        return null;
    }
}
