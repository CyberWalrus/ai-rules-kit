import { describe, expect, it } from 'vitest';

import { convertDocsCatalog } from '../convert-docs-catalog';

describe('convertDocsCatalog', () => {
    it('должен удалять секцию Rules Files', () => {
        const content = `# Catalog

### Rules Files
1. Rule 1
2. Rule 2

### Docs Files
1. Doc 1
2. Doc 2`;

        const result = convertDocsCatalog(content);

        expect(result).not.toContain('### Rules Files');
        expect(result).not.toContain('Rule 1');
        expect(result).toContain('### Claude Code Docs Files');
    });

    it('должен удалять секцию Commands Files', () => {
        const content = `# Catalog

### Commands Files
1. Command 1
2. Command 2

### Docs Files
1. Doc 1`;

        const result = convertDocsCatalog(content);

        expect(result).not.toContain('### Commands Files');
        expect(result).not.toContain('Command 1');
    });

    it('должен заменять {{DOCS_DIR}} на {{CLAUDE_DOCS_DIR}}', () => {
        const content = `# Catalog

### Docs Files
Path: {{DOCS_DIR}}/file.md`;

        const result = convertDocsCatalog(content);

        expect(result).toContain('{{CLAUDE_DOCS_DIR}}/file.md');
        expect(result).not.toContain('{{DOCS_DIR}}');
    });

    it('должен заменять {{RULES_DIR}} на {{CLAUDE_DOCS_DIR}}', () => {
        const content = `# Catalog

### Docs Files
Path: {{RULES_DIR}}/file.md`;

        const result = convertDocsCatalog(content);

        expect(result).toContain('{{CLAUDE_DOCS_DIR}}/file.md');
        expect(result).not.toContain('{{RULES_DIR}}');
    });
});
