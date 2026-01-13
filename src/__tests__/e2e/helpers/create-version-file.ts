import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { RulesConfig } from '../../../model';

export async function createVersionFile(targetDir: string, version: string): Promise<void> {
    const config: RulesConfig = {
        cliVersion: '1.0.0',
        configVersion: '1.0.0',
        fileOverrides: [],
        ideType: 'cursor',
        ignoreList: [],
        installedAt: new Date().toISOString(),
        promptsVersion: version,
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
        updatedAt: new Date().toISOString(),
    };

    await mkdir(join(targetDir, '.cursor'), { recursive: true });
    await writeFile(join(targetDir, '.cursor', 'ai-rules-kit-config.json'), JSON.stringify(config, null, 2));
}
