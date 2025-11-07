import { beforeEach, describe, expect, it, vi } from 'vitest';

import { applyYamlOverrides } from '../apply-yaml-overrides';

const { mockReadFile, mockWriteFile } = vi.hoisted(() => ({
    mockReadFile: vi.fn(),
    mockWriteFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    readFile: mockReadFile,
    writeFile: mockWriteFile,
}));

vi.mock('gray-matter', async () =>
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    vi.importActual('gray-matter'),
);

describe('applyYamlOverrides', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен применять переопределения к существующим YAML параметрам', async () => {
        const originalContent = `---
id: test-rule
type: reference
alwaysApply: false
---

Content here
`;

        mockReadFile.mockResolvedValue(originalContent);
        mockWriteFile.mockResolvedValue(undefined);

        await applyYamlOverrides('/path/to/file.mdc', {
            alwaysApply: true,
            priority: 10,
        });

        expect(mockReadFile).toHaveBeenCalledWith('/path/to/file.mdc', 'utf-8');
        expect(mockWriteFile).toHaveBeenCalled();

        const writtenContent = mockWriteFile.mock.calls[0]?.[1] as string;

        expect(writtenContent).toContain('alwaysApply: true');
        expect(writtenContent).toContain('priority: 10');
        expect(writtenContent).toContain('id: test-rule');
        expect(writtenContent).toContain('type: reference');
    });

    it('должен добавлять новые параметры если их нет', async () => {
        const originalContent = `---
id: test-rule
---

Content here
`;

        mockReadFile.mockResolvedValue(originalContent);
        mockWriteFile.mockResolvedValue(undefined);

        await applyYamlOverrides('/path/to/file.mdc', {
            alwaysApply: true,
        });

        const writtenContent = mockWriteFile.mock.calls[0]?.[1] as string;

        expect(writtenContent).toContain('alwaysApply: true');
        expect(writtenContent).toContain('id: test-rule');
    });

    it('должен сохранять контент файла без изменений', async () => {
        const originalContent = `---
id: test-rule
---

Content here
More content
`;

        mockReadFile.mockResolvedValue(originalContent);
        mockWriteFile.mockResolvedValue(undefined);

        await applyYamlOverrides('/path/to/file.mdc', {
            alwaysApply: true,
        });

        const writtenContent = mockWriteFile.mock.calls[0]?.[1] as string;

        expect(writtenContent).toContain('Content here');
        expect(writtenContent).toContain('More content');
    });

    it('должен обрабатывать файлы без frontmatter', async () => {
        const originalContent = 'Content without frontmatter';

        mockReadFile.mockResolvedValue(originalContent);
        mockWriteFile.mockResolvedValue(undefined);

        await applyYamlOverrides('/path/to/file.mdc', {
            alwaysApply: true,
        });

        const writtenContent = mockWriteFile.mock.calls[0]?.[1] as string;

        expect(writtenContent).toContain('alwaysApply: true');
        expect(writtenContent).toContain('Content without frontmatter');
    });
});
