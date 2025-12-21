import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { McpConfig } from '../../../model/types/main';
import { writeMcpConfig } from '../write-mcp-config';

const { mockGetCursorMcpConfigPath, mockMkdir, mockWriteFile } = vi.hoisted(() => ({
    mockGetCursorMcpConfigPath: vi.fn(),
    mockMkdir: vi.fn(),
    mockWriteFile: vi.fn(),
}));

vi.mock('../../cursor-config', () => ({
    getCursorMcpConfigPath: mockGetCursorMcpConfigPath,
}));

vi.mock('node:fs/promises', () => ({
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
}));

describe('writeMcpConfig', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен записывать конфигурацию MCP в файл', async () => {
        const mockConfigPath = '/Users/test/.cursor/mcp.json';
        const config: McpConfig = {
            mcpServers: {
                test: {
                    args: ['-y', 'test-server'],
                    command: 'npx',
                    env: {
                        API_KEY: 'test-key',
                    },
                },
            },
        };

        mockGetCursorMcpConfigPath.mockResolvedValue(mockConfigPath);
        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockResolvedValue(undefined);

        await writeMcpConfig(config);

        expect(mockMkdir).toHaveBeenCalledWith('/Users/test/.cursor', { recursive: true });
        expect(mockWriteFile).toHaveBeenCalledWith(mockConfigPath, JSON.stringify(config, null, 4), 'utf-8');
    });

    it('должен выбрасывать ошибку если config равен null', async () => {
        await expect(writeMcpConfig(null as unknown as McpConfig)).rejects.toThrow('config is required');
    });

    it('должен выбрасывать ошибку если config равен undefined', async () => {
        await expect(writeMcpConfig(undefined as unknown as McpConfig)).rejects.toThrow('config is required');
    });
});
