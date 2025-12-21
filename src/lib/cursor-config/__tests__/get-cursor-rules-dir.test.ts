import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCursorConfigDir } from '../get-cursor-config-dir';
import { getCursorRulesDir } from '../get-cursor-rules-dir';

vi.mock('../get-cursor-config-dir', () => ({
    getCursorConfigDir: vi.fn(),
}));

describe('getCursorRulesDir', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен возвращать путь к директории правил', async () => {
        const mockConfigDir = '/Users/test/Library/Application Support/Cursor';
        vi.mocked(getCursorConfigDir).mockResolvedValue(mockConfigDir);

        const result = await getCursorRulesDir();

        expect(result).toBe(join(mockConfigDir, 'rules'));
    });
});
