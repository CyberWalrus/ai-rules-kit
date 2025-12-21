import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { writeGlobalRule } from '../write-global-rule';

const { mockGetCursorRulesDir, mockMkdir, mockWriteFile } = vi.hoisted(() => ({
    mockGetCursorRulesDir: vi.fn(),
    mockMkdir: vi.fn(),
    mockWriteFile: vi.fn(),
}));

vi.mock('../../cursor-config', () => ({
    getCursorRulesDir: mockGetCursorRulesDir,
}));

vi.mock('node:fs/promises', () => ({
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
}));

describe('writeGlobalRule', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен записывать файл правила', async () => {
        const mockRulesDir = '/Users/test/.cursor/rules';
        const ruleName = 'meta-info.md';
        const ruleContent = '---\nid: test\n---\n# Test Rule';

        mockGetCursorRulesDir.mockResolvedValue(mockRulesDir);
        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockResolvedValue(undefined);

        await writeGlobalRule(ruleName, ruleContent);

        expect(mockMkdir).toHaveBeenCalledWith(mockRulesDir, { recursive: true });
        expect(mockWriteFile).toHaveBeenCalledWith(join(mockRulesDir, ruleName), ruleContent, 'utf-8');
    });
});
