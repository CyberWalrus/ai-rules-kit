import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { McpConfig } from '../../../model/types/main';
import { readMcpConfig } from '../read-mcp-config';

const { mockGetCursorMcpConfigPath, mockPathExists, mockReadFile } = vi.hoisted(() => ({
    mockGetCursorMcpConfigPath: vi.fn(),
    mockPathExists: vi.fn(),
    mockReadFile: vi.fn(),
}));

vi.mock('../../cursor-config', () => ({
    getCursorMcpConfigPath: mockGetCursorMcpConfigPath,
}));

vi.mock('../../file-operations/path-exists', () => ({
    pathExists: mockPathExists,
}));

vi.mock('node:fs/promises', () => ({
    readFile: mockReadFile,
}));

describe('readMcpConfig', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен читать и парсить конфигурацию MCP', async () => {
        const mockConfigPath = '/Users/test/.cursor/mcp.json';
        const config: McpConfig = {
            mcpServers: {
                test: {
                    args: ['-y', 'test-server'],
                    command: 'npx',
                },
            },
        };

        mockGetCursorMcpConfigPath.mockResolvedValue(mockConfigPath);
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(config));

        const result = await readMcpConfig();

        expect(result).toEqual(config);
        expect(mockReadFile).toHaveBeenCalledWith(mockConfigPath, 'utf8');
    });

    it('должен возвращать null если файл не существует', async () => {
        const mockConfigPath = '/Users/test/.cursor/mcp.json';

        mockGetCursorMcpConfigPath.mockResolvedValue(mockConfigPath);
        mockPathExists.mockResolvedValue(false);

        const result = await readMcpConfig();

        expect(result).toBeNull();
        expect(mockReadFile).not.toHaveBeenCalled();
    });

    it('должен возвращать конфигурацию с пустым mcpServers если поле отсутствует', async () => {
        const mockConfigPath = '/Users/test/.cursor/mcp.json';
        const invalidConfig = {};

        mockGetCursorMcpConfigPath.mockResolvedValue(mockConfigPath);
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(invalidConfig));

        const result = await readMcpConfig();

        expect(result).toEqual({ mcpServers: {} });
    });

    it('должен возвращать null при ошибке парсинга JSON', async () => {
        const mockConfigPath = '/Users/test/.cursor/mcp.json';

        mockGetCursorMcpConfigPath.mockResolvedValue(mockConfigPath);
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue('invalid json');

        const result = await readMcpConfig();

        expect(result).toBeNull();
    });
});
