import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { applyYamlOverrides } from '../apply-yaml-overrides';

function getTestPath(...segments: string[]): string {
    return join(tmpdir(), 'cursor-rules-test', ...segments);
}

const { mockReadFile, mockWriteFile } = vi.hoisted(() => ({
    mockReadFile: vi.fn(),
    mockWriteFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    readFile: mockReadFile,
    writeFile: mockWriteFile,
}));

vi.mock('gray-matter', async () => vi.importActual('gray-matter'));

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

        const testFilePath = getTestPath('path', 'to', 'file.mdc');

        await applyYamlOverrides(testFilePath, {
            alwaysApply: true,
            priority: 10,
        });

        expect(mockReadFile).toHaveBeenCalledWith(testFilePath, 'utf8');
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

        const testFilePath = getTestPath('path', 'to', 'file.mdc');

        await applyYamlOverrides(testFilePath, {
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

        const testFilePath = getTestPath('path', 'to', 'file.mdc');

        await applyYamlOverrides(testFilePath, {
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

        const testFilePath = getTestPath('path', 'to', 'file.mdc');

        await applyYamlOverrides(testFilePath, {
            alwaysApply: true,
        });

        const writtenContent = mockWriteFile.mock.calls[0]?.[1] as string;

        expect(writtenContent).toContain('alwaysApply: true');
        expect(writtenContent).toContain('Content without frontmatter');
    });
});
