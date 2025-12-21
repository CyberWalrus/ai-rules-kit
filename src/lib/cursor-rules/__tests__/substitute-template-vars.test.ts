import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TemplateVariables } from '../../../model';
import { getMetaInfoTemplatePath } from '../get-meta-info-template-path';
import { substituteTemplateVars } from '../substitute-template-vars';

const { mockReadFile } = vi.hoisted(() => ({
    mockReadFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    readFile: mockReadFile,
}));

describe('substituteTemplateVars', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен подставлять переменные в шаблон', async () => {
        const templatePath = '/path/to/template.md';
        const templateContent = 'Name: ${NAME}\nAge: ${AGE}\nRole: ${ROLE}'; // eslint-disable-line no-template-curly-in-string
        const variables: TemplateVariables = {
            AGE: '30',
            NAME: 'John Doe',
            ROLE: 'Developer',
        };

        mockReadFile.mockResolvedValue(templateContent);

        const result = await substituteTemplateVars(templatePath, variables);

        expect(result).toBe('Name: John Doe\nAge: 30\nRole: Developer');
    });

    it('должен подставлять все переменные из шаблона', async () => {
        const templatePath = '/path/to/template.md';
        const templateContent = 'Date: ${CURRENT_DATE}\nStack: ${STACK}\nOS: ${OS}'; // eslint-disable-line no-template-curly-in-string
        const variables: TemplateVariables = {
            CURRENT_DATE: '2025-12-02',
            OS: 'macOS',
            STACK: 'TypeScript, React',
        };

        mockReadFile.mockResolvedValue(templateContent);

        const result = await substituteTemplateVars(templatePath, variables);

        expect(result).toBe('Date: 2025-12-02\nStack: TypeScript, React\nOS: macOS');
    });

    it('должен оставлять неподставленные переменные как есть', async () => {
        const templatePath = '/path/to/template.md';
        const templateContent = 'Name: ${NAME}\nUnknown: ${UNKNOWN}'; // eslint-disable-line no-template-curly-in-string
        const variables: TemplateVariables = {
            NAME: 'John',
        };

        mockReadFile.mockResolvedValue(templateContent);

        const result = await substituteTemplateVars(templatePath, variables);

        expect(result).toBe('Name: John\nUnknown: ${UNKNOWN}'); // eslint-disable-line no-template-curly-in-string
    });
});

describe('getMetaInfoTemplatePath', () => {
    it('должен возвращать путь к шаблону meta-info.template.md', () => {
        const result = getMetaInfoTemplatePath();
        const expected = join(process.cwd(), 'user-rules', 'meta-info.template.md');

        expect(result).toBe(expected);
    });
});
