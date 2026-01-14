import { describe, expect, it } from 'vitest';

import { getClaudeDocsDir } from '../get-claude-docs-dir';

describe('getClaudeDocsDir', () => {
    it('должен возвращать путь к директории docs', () => {
        expect(getClaudeDocsDir()).toBe('.claude/docs');
    });
});
