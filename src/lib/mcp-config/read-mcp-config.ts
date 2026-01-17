import { readFile } from 'node:fs/promises';

import type { McpConfig } from '../../model/types/main';
import { getCursorMcpConfigPath } from '../cursor-config';
import { pathExists } from '../file-operations/path-exists';

/** Читает и парсит конфигурацию MCP серверов */
export async function readMcpConfig(): Promise<McpConfig | null> {
    try {
        const configPath = await getCursorMcpConfigPath();
        const exists = await pathExists(configPath);

        if (exists === false) {
            return null;
        }

        const content = await readFile(configPath, 'utf8');
        const parsed = JSON.parse(content) as unknown;

        if (typeof parsed !== 'object' || parsed === null) {
            return null;
        }

        const config = parsed as McpConfig;

        if (config.mcpServers === null || config.mcpServers === undefined) {
            return {
                mcpServers: {},
            };
        }

        return config;
    } catch {
        return null;
    }
}
