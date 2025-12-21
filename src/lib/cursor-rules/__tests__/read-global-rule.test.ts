import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { readGlobalRule } from '../read-global-rule';

const { mockGetCursorRulesDir, mockReadFile } = vi.hoisted(() => ({
    mockGetCursorRulesDir: vi.fn(),
    mockReadFile: vi.fn(),
}));

vi.mock('../../cursor-config', () => ({
    getCursorRulesDir: mockGetCursorRulesDir,
}));

vi.mock('node:fs/promises', () => ({
    readFile: mockReadFile,
}));

describe('readGlobalRule', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен читать файл правила', async () => {
        const mockRulesDir = '/Users/test/.cursor/rules';
        const ruleName = 'meta-info.md';
        const ruleContent = '---\nid: test\n---\n# Test Rule';

        mockGetCursorRulesDir.mockResolvedValue(mockRulesDir);
        mockReadFile.mockResolvedValue(ruleContent);

        const result = await readGlobalRule(ruleName);

        expect(result).toBe(ruleContent);
        expect(mockReadFile).toHaveBeenCalledWith(join(mockRulesDir, ruleName), 'utf-8');
    });

    it('должен возвращать null если файл не существует', async () => {
        const mockRulesDir = '/Users/test/.cursor/rules';
        const ruleName = 'non-existent.md';

        mockGetCursorRulesDir.mockResolvedValue(mockRulesDir);
        mockReadFile.mockRejectedValue(new Error('File not found'));

        const result = await readGlobalRule(ruleName);

        expect(result).toBeNull();
    });
});
