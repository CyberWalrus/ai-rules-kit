import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { RulesConfig } from '../../model';
import { VERSION_FILE_NAME } from '../../model';
import { isEmptyString } from '../helpers';
import type { IdeType } from '../ide-config';
import { getProjectIdeDir } from '../ide-config';

/** Записывает файл конфигурации в целевую директорию */
export async function writeConfigFile(targetDir: string, config: RulesConfig, ideType: IdeType): Promise<void> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }
    if (config === null || config === undefined) {
        throw new Error('config is required');
    }

    const ideDir = getProjectIdeDir(ideType);
    const configFilePath = join(targetDir, ideDir, VERSION_FILE_NAME);
    const configWithSchema = {
        $schema: `https://raw.githubusercontent.com/CyberWalrus/ai-rules-kit/main/schemas/ai-rules-kit-config-${config.configVersion}.schema.json`,
        ...config,
        ideType,
    };
    const content = JSON.stringify(configWithSchema, null, 2);

    try {
        await mkdir(join(targetDir, ideDir), { recursive: true });
        await writeFile(configFilePath, content, 'utf8');
    } catch (error) {
        throw new Error(`Failed to write config file: ${String(error)}`);
    }
}
