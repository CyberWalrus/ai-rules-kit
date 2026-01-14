import { describe, expect, it } from 'vitest';

import { parseRuleFrontmatter } from '../parse-rule-frontmatter';

describe('parseRuleFrontmatter', () => {
    it('должен возвращать null при отсутствии YAML', () => {
        const content = '# Just markdown content';
        expect(parseRuleFrontmatter(content)).toBeNull();
    });

    it('должен возвращать null при отсутствии id', () => {
        const content = `---
alwaysApply: true
---
# Content`;
        expect(parseRuleFrontmatter(content)).toBeNull();
    });

    it('должен парсить валидный YAML frontmatter', () => {
        const content = `---
id: test-rule
type: compact
alwaysApply: true
---
# Content`;
        expect(parseRuleFrontmatter(content)).toEqual({
            alwaysApply: true,
            description: undefined,
            id: 'test-rule',
            type: 'compact',
        });
    });

    it('должен извлекать description', () => {
        const content = `---
id: test-rule
description: Test description
---
# Content`;
        expect(parseRuleFrontmatter(content)).toEqual({
            alwaysApply: false,
            description: 'Test description',
            id: 'test-rule',
            type: 'unknown',
        });
    });
});
