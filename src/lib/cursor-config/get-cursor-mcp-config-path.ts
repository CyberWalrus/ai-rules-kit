import { join } from 'node:path';

import { getCursorConfigDir } from './get-cursor-config-dir';

/** Определяет путь к файлу конфигурации MCP серверов */
export async function getCursorMcpConfigPath(): Promise<string> {
    const configDir = await getCursorConfigDir();

    return join(configDir, 'mcp.json');
}
