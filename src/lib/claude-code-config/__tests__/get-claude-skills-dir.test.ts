import { describe, expect, it } from 'vitest';

import { getClaudeSkillsDir } from '../get-claude-skills-dir';

describe('getClaudeSkillsDir', () => {
    it('должен возвращать путь к директории skills', () => {
        expect(getClaudeSkillsDir()).toBe('.claude/skills');
    });
});
