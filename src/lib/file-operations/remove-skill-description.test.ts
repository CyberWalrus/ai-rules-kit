import { describe, expect, it } from 'vitest';

import { removeSkillDescription } from './remove-skill-description';

describe('removeSkillDescription', () => {
    it('должен удалять поле description из YAML frontmatter', () => {
        const content = `---
id: test-rule
type: compact
alwaysApply: true
description: This is a test description
---

# Content

Some content here.`;

        const result = removeSkillDescription(content);

        expect(result).not.toContain('description:');
        expect(result).toContain('id: test-rule');
        expect(result).toContain('type: compact');
        expect(result).toContain('# Content');
    });

    it('должен сохранять другие поля YAML frontmatter', () => {
        const content = `---
id: test-rule
type: compact
alwaysApply: true
description: This is a test description
globs: "**/*.md"
---

# Content`;

        const result = removeSkillDescription(content);

        expect(result).toContain('id: test-rule');
        expect(result).toContain('type: compact');
        expect(result).toContain('alwaysApply: true');
        // gray-matter конвертирует двойные кавычки в одинарные
        expect(result).toContain(`globs: '**/*.md'`);
        expect(result).not.toContain('description:');
    });

    it('должен возвращать контент без frontmatter если других полей нет', () => {
        const content = `---
description: This is a test description
---

# Content

Some content here.`;

        const result = removeSkillDescription(content);

        expect(result).not.toContain('---');
        expect(result).toContain('# Content');
        expect(result).not.toContain('description:');
    });

    it('должен возвращать исходный контент если нет поля description', () => {
        const content = `---
id: test-rule
type: compact
---

# Content`;

        const result = removeSkillDescription(content);

        // gray-matter добавляет перенос строки, поэтому проверяем по ключам
        expect(result).toContain('id: test-rule');
        expect(result).toContain('type: compact');
        expect(result).toContain('# Content');
        expect(result).not.toContain('description:');
    });

    it('должен возвращать исходный контент если нет YAML frontmatter', () => {
        const content = `# Content

Some content here.`;

        const result = removeSkillDescription(content);

        expect(result).toBe(content);
    });

    it('должен обрабатывать многострочное описание', () => {
        const content = `---
id: test-rule
description: |
  This is a multi-line
  description that spans
  multiple lines
alwaysApply: true
---

# Content`;

        const result = removeSkillDescription(content);

        expect(result).not.toContain('description:');
        expect(result).toContain('id: test-rule');
        expect(result).toContain('alwaysApply: true');
    });
});
