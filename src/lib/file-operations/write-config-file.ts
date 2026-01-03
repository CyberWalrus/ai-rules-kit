import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { RulesConfig } from '../../model';
import { VERSION_FILE_NAME } from '../../model';
import { isEmptyString } from '../helpers';

/** Записывает файл конфигурации в целевую директорию */
export async function writeConfigFile(targetDir: string, config: RulesConfig): Promise<void> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }
    if (config === null || config === undefined) {
        throw new Error('config is required');
    }

    const cursorDir = join(targetDir, '.cursor');
    const configFilePath = join(cursorDir, VERSION_FILE_NAME);
    const configWithSchema = {
        $schema: `https://raw.githubusercontent.com/CyberWalrus/cursor-rules-cli/main/schemas/cursor-rules-config-${config.configVersion}.schema.json`,
        ...config,
    };
    const content = JSON.stringify(configWithSchema, null, 2);

    try {
        await mkdir(cursorDir, { recursive: true });
        await writeFile(configFilePath, content, 'utf-8');
    } catch (error) {
        throw new Error(`Failed to write config file: ${String(error)}`);
    }
}
