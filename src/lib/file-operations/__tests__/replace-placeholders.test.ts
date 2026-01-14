import { describe, expect, it } from 'vitest';

import { replacePlaceholders } from '../replace-placeholders';

describe('replacePlaceholders', () => {
    it('должен заменять {{IDE_DIR}} на .cursor для Cursor IDE', () => {
        const content = 'Path: {{IDE_DIR}}/rules/file.mdc';
        const result = replacePlaceholders(content, 'cursor');

        expect(result).toBe('Path: .cursor/rules/file.mdc');
    });

    it('должен заменять {{IDE_DIR}} на .trae для TRAE IDE', () => {
        const content = 'Path: {{IDE_DIR}}/rules/file.md';
        const result = replacePlaceholders(content, 'trae');

        expect(result).toBe('Path: .trae/rules/file.md');
    });

    it('должен заменять {{FILE_EXT}} на .mdc для Cursor IDE', () => {
        const content = 'File: {{RULES_DIR}}/test{{FILE_EXT}}';
        const result = replacePlaceholders(content, 'cursor');

        expect(result).toBe('File: .cursor/rules/test.mdc');
    });

    it('должен заменять {{FILE_EXT}} на .md для TRAE IDE', () => {
        const content = 'File: {{RULES_DIR}}/test{{FILE_EXT}}';
        const result = replacePlaceholders(content, 'trae');

        expect(result).toBe('File: .trae/rules/test.md');
    });

    it('должен заменять {{RULES_DIR}} на .cursor/rules для Cursor IDE', () => {
        const content = 'See {{RULES_DIR}}/file.mdc';
        const result = replacePlaceholders(content, 'cursor');

        expect(result).toBe('See .cursor/rules/file.mdc');
    });

    it('должен заменять {{RULES_DIR}} на .trae/rules для TRAE IDE', () => {
        const content = 'See {{RULES_DIR}}/file.md';
        const result = replacePlaceholders(content, 'trae');

        expect(result).toBe('See .trae/rules/file.md');
    });

    it('должен заменять {{DOCS_DIR}} на .cursor/docs для Cursor IDE', () => {
        const content = 'See {{DOCS_DIR}}/file.md';
        const result = replacePlaceholders(content, 'cursor');

        expect(result).toBe('See .cursor/docs/file.md');
    });

    it('должен заменять {{DOCS_DIR}} на .trae/docs для TRAE IDE', () => {
        const content = 'See {{DOCS_DIR}}/file.md';
        const result = replacePlaceholders(content, 'trae');

        expect(result).toBe('See .trae/docs/file.md');
    });

    it('должен заменять {{COMMANDS_DIR}} на .cursor/commands для Cursor IDE', () => {
        const content = 'See {{COMMANDS_DIR}}/file.md';
        const result = replacePlaceholders(content, 'cursor');

        expect(result).toBe('See .cursor/commands/file.md');
    });

    it('должен заменять {{COMMANDS_DIR}} на .trae/commands для TRAE IDE', () => {
        const content = 'See {{COMMANDS_DIR}}/file.md';
        const result = replacePlaceholders(content, 'trae');

        expect(result).toBe('See .trae/commands/file.md');
    });

    it('должен заменять все плейсхолдеры в одном тексте для Cursor IDE', () => {
        const content = `
Rules: {{RULES_DIR}}/*{{FILE_EXT}}
Docs: {{DOCS_DIR}}/*.md
Commands: {{COMMANDS_DIR}}/*.md
IDE: {{IDE_DIR}}
`;
        const result = replacePlaceholders(content, 'cursor');

        expect(result).toContain('.cursor/rules/*.mdc');
        expect(result).toContain('.cursor/docs/*.md');
        expect(result).toContain('.cursor/commands/*.md');
        expect(result).toContain('IDE: .cursor');
    });

    it('должен заменять все плейсхолдеры в одном тексте для TRAE IDE', () => {
        const content = `
Rules: {{RULES_DIR}}/*{{FILE_EXT}}
Docs: {{DOCS_DIR}}/*.md
Commands: {{COMMANDS_DIR}}/*.md
IDE: {{IDE_DIR}}
`;
        const result = replacePlaceholders(content, 'trae');

        expect(result).toContain('.trae/rules/*.md');
        expect(result).toContain('.trae/docs/*.md');
        expect(result).toContain('.trae/commands/*.md');
        expect(result).toContain('IDE: .trae');
    });

    it('должен заменять множественные вхождения одного плейсхолдера', () => {
        const content = '{{RULES_DIR}}/file1{{FILE_EXT}} and {{RULES_DIR}}/file2{{FILE_EXT}}';
        const result = replacePlaceholders(content, 'cursor');

        expect(result).toBe('.cursor/rules/file1.mdc and .cursor/rules/file2.mdc');
    });

    it('должен возвращать исходный текст если плейсхолдеров нет', () => {
        const content = 'Some text without placeholders';
        const result = replacePlaceholders(content, 'cursor');

        expect(result).toBe('Some text without placeholders');
    });

    it('должен обрабатывать пустую строку', () => {
        const result = replacePlaceholders('', 'cursor');

        expect(result).toBe('');
    });

    it('должен возвращать пустую строку если content undefined', () => {
        const result = replacePlaceholders(undefined, 'cursor');

        expect(result).toBe('');
    });

    it('должен заменять плейсхолдеры в Markdown коде', () => {
        const content = `
\`\`\`
read_file('{{RULES_DIR}}/test{{FILE_EXT}}')
\`\`\`
`;
        const result = replacePlaceholders(content, 'cursor');

        expect(result).toContain("read_file('.cursor/rules/test.mdc')");
    });
});
