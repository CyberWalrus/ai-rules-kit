import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { RulesConfig } from '../../model';
import { rulesConfigSchema, VERSION_FILE_NAME } from '../../model';
import { isEmptyString } from '../helpers';
import { pathExists } from './path-exists';

/** Читает файл конфигурации из целевой директории */
export async function readConfigFile(targetDir: string): Promise<RulesConfig | null> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    const configFilePath = join(targetDir, '.cursor', VERSION_FILE_NAME);
    const fileExists = await pathExists(configFilePath);

    if (fileExists === false) {
        return null;
    }

    try {
        const content = await readFile(configFilePath, 'utf-8');
        const parsed = JSON.parse(content) as unknown;

        return rulesConfigSchema.parse(parsed);
    } catch {
        return null;
    }
}
