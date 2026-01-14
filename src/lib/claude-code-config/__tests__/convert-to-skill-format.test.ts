import { describe, expect, it } from 'vitest';

import { convertToSkillFormat } from '../convert-to-skill-format';

describe('convertToSkillFormat', () => {
    it('должен возвращать null при отсутствии id', () => {
        const content = '# Just markdown';
        expect(convertToSkillFormat(content)).toBeNull();
    });

    it('должен конвертировать правило в SKILL.md формат', () => {
        const content = `---
id: code-workflow
alwaysApply: false
---
# Code Workflow

Instructions here.`;

        const result = convertToSkillFormat(content);

        expect(result).not.toBeNull();
        expect(result?.dirName).toBe('code-workflow');
        expect(result?.content).toContain('name: code-workflow');
        expect(result?.content).toContain('# Code Workflow');
    });

    it('должен добавлять description при отсутствии', () => {
        const content = `---
id: test-rule
alwaysApply: false
---
# Content`;

        const result = convertToSkillFormat(content);

        expect(result?.content).toContain('description: AI skill for test-rule');
    });
});
