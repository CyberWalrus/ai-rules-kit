import { describe, expect, it } from 'vitest';

import { getClaudeSettingsPath } from '../get-claude-settings-path';

describe('getClaudeSettingsPath', () => {
    it('должен возвращать путь к settings.json', () => {
        expect(getClaudeSettingsPath()).toBe('.claude/settings.json');
    });
});
