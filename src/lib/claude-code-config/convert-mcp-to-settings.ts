import type { McpConfig } from '../../model';

/**
 * Конвертирует mcp.json в строку settings.json для Claude Code
 * @param mcpConfig - Конфигурация MCP из Cursor
 * @returns JSON строка для записи в файл
 */
export function convertMcpToSettingsJson(mcpConfig: McpConfig): string {
    return JSON.stringify({ mcpServers: mcpConfig.mcpServers }, null, 4);
}
