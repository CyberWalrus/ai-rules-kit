import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { RulesConfig } from '../../model';
import { rulesConfigSchema, VERSION_FILE_NAME } from '../../model';
import { isEmptyString } from '../helpers';
import { pathExists } from './path-exists';
import { writeConfigFile } from './write-config-file';

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
        const parsed = JSON.parse(content) as { [key: string]: unknown; $schema?: string };

        const oldSchemaPattern = /\.cursor\/cursor-rules-config-(\d+\.\d+\.\d+)\.schema\.json/;
        const hasOldSchema = parsed.$schema && oldSchemaPattern.test(parsed.$schema);

        const config = rulesConfigSchema.parse(parsed);

        if (hasOldSchema && config.configVersion) {
            const newSchema = `https://raw.githubusercontent.com/CyberWalrus/cursor-rules-cli/main/schemas/cursor-rules-config-${config.configVersion}.schema.json`;
            if (parsed.$schema !== newSchema) {
                await writeConfigFile(targetDir, config);
            }
        }

        return config;
    } catch {
        return null;
    }
}
