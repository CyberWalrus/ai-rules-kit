import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { McpConfig } from '../../model/types/main';
import { getCursorMcpConfigPath } from '../cursor-config';

/** Записывает конфигурацию MCP серверов в файл */
export async function writeMcpConfig(config: McpConfig): Promise<void> {
    if (config === null || config === undefined) {
        throw new Error('config is required');
    }

    const configPath = await getCursorMcpConfigPath();
    const configDir = dirname(configPath);
    const content = JSON.stringify(config, null, 4);

    await mkdir(configDir, { recursive: true });
    await writeFile(configPath, content, 'utf-8');
}
