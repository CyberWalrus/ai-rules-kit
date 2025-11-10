import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isEmptyString } from '../../../lib/helpers';
import type { RulesConfig } from '../../../model';
import { VERSION_FILE_NAME } from '../../../model';

/** Создает файл .cursor/cursor-rules-config.json */
export async function createVersionFile(targetDir: string, promptsVersion: string): Promise<void> {
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }
    if (isEmptyString(promptsVersion)) {
        throw new Error('promptsVersion is required');
    }

    const currentTimestamp = new Date().toISOString();
    const config: RulesConfig = {
        cliVersion: '1.0.0',
        configVersion: '1.0.0',
        fileOverrides: [],
        ignoreList: [],
        installedAt: currentTimestamp,
        promptsVersion,
        ruleSets: [
            {
                id: 'base',
                update: true,
            },
        ],
        settings: {
            language: 'ru',
        },
        source: 'cursor-rules',
        updatedAt: currentTimestamp,
    };

    const cursorDir = join(targetDir, '.cursor');
    const configFilePath = join(cursorDir, VERSION_FILE_NAME);
    try {
        await mkdir(cursorDir, { recursive: true });
        await writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
        throw new Error(`Failed to write config file: ${String(error)}`);
    }
}
