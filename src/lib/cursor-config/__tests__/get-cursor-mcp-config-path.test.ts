import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCursorConfigDir } from '../get-cursor-config-dir';
import { getCursorMcpConfigPath } from '../get-cursor-mcp-config-path';

vi.mock('../get-cursor-config-dir', () => ({
    getCursorConfigDir: vi.fn(),
}));

describe('getCursorMcpConfigPath', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен возвращать путь к файлу mcp.json', async () => {
        const mockConfigDir = '/Users/test/Library/Application Support/Cursor';
        vi.mocked(getCursorConfigDir).mockResolvedValue(mockConfigDir);

        const result = await getCursorMcpConfigPath();

        expect(result).toBe(join(mockConfigDir, 'mcp.json'));
    });
});
