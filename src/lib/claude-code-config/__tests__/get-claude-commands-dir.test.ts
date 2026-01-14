import { describe, expect, it } from 'vitest';

import { getClaudeCommandsDir } from '../get-claude-commands-dir';

describe('getClaudeCommandsDir', () => {
    it('должен возвращать путь к директории commands', () => {
        expect(getClaudeCommandsDir()).toBe('.claude/commands');
    });
});
