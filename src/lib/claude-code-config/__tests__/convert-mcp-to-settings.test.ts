import { describe, expect, it } from 'vitest';

import { convertMcpToSettingsJson } from '../convert-mcp-to-settings';

describe('convertMcpToSettingsJson', () => {
    it('должен конвертировать McpConfig в JSON', () => {
        const mcpConfig = {
            mcpServers: {
                'test-server': {
                    args: ['-y', 'test-package'],
                    command: 'npx',
                    env: { TEST: 'value' },
                },
            },
        };

        const result = convertMcpToSettingsJson(mcpConfig);

        expect(result).toBe(JSON.stringify({ mcpServers: mcpConfig.mcpServers }, null, 4));
    });

    it('должен сохранять структуру MCP серверов', () => {
        const mcpConfig = {
            mcpServers: {
                server1: { command: 'cmd1' },
                server2: { args: ['arg1'], command: 'cmd2' },
            },
        };

        const result = JSON.parse(convertMcpToSettingsJson(mcpConfig));

        expect(result.mcpServers.server1.command).toBe('cmd1');
        expect(result.mcpServers.server2.command).toBe('cmd2');
    });
});
