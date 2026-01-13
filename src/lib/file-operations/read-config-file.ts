import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { RulesConfig } from '../../model';
import { rulesConfigSchema, VERSION_FILE_NAME } from '../../model';
import { isEmptyString } from '../helpers';
import type { IdeType } from '../ide-config';
import { getProjectIdeDir } from '../ide-config';
import { pathExists } from './path-exists';
import { writeConfigFile } from './write-config-file';

/** Читает и парсит файл конфигурации */
async function readAndParseConfig(configFilePath: string): Promise<RulesConfig | null> {
    try {
        const content = await readFile(configFilePath, 'utf-8');
        const parsed = JSON.parse(content) as { [key: string]: unknown; $schema?: string };

        const oldSchemaPattern = /\.(cursor|trae)\/(cursor-rules|ai-rules-kit)-config-(\d+\.\d+\.\d+)\.schema\.json/;
        const hasOldSchema = parsed.$schema && oldSchemaPattern.test(parsed.$schema);

        const config = rulesConfigSchema.parse(parsed);

        if (hasOldSchema && config.configVersion && config.ideType) {
            const newSchema = `https://raw.githubusercontent.com/CyberWalrus/ai-rules-kit/main/schemas/ai-rules-kit-config-${config.configVersion}.schema.json`;
            if (parsed.$schema !== newSchema) {
                const targetDir = configFilePath.substring(0, configFilePath.lastIndexOf('/'));
                const { ideType } = config;
                await writeConfigFile(targetDir, config, ideType);
            }
        }

        return config;
    } catch {
        return null;
    }
}

/** Читает файл конфигурации из целевой директории */
export async function readConfigFile(targetDir: string, ideType?: IdeType): Promise<RulesConfig | null> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    const ideTypesToCheck: IdeType[] = ideType ? [ideType] : ['cursor', 'trae'];

    for (const currentIdeType of ideTypesToCheck) {
        const ideDir = getProjectIdeDir(currentIdeType);
        const configFilePath = join(targetDir, ideDir, VERSION_FILE_NAME);
        const fileExists = await pathExists(configFilePath);

        if (fileExists) {
            return readAndParseConfig(configFilePath);
        }
    }

    return null;
}
