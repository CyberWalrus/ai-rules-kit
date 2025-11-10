import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createTestConfig } from '../../../__tests__/helpers/create-test-config';
import type { RulesConfig } from '../../../model';
import { readConfigFile } from '../read-config-file';

function getTestPath(...segments: string[]): string {
    return join(tmpdir(), 'cursor-rules-test', ...segments);
}

const { mockReadFile, mockPathExists } = vi.hoisted(() => ({
    mockPathExists: vi.fn(),
    mockReadFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    readFile: mockReadFile,
}));

vi.mock('../path-exists', () => ({
    pathExists: mockPathExists,
}));

describe('readConfigFile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен читать и парсить файл конфигурации', async () => {
        const config: RulesConfig = createTestConfig();

        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(config));

        const targetDir = getTestPath('target');

        const result = await readConfigFile(targetDir);

        expect(result).toEqual(config);
        expect(mockPathExists).toHaveBeenCalled();
        expect(mockReadFile).toHaveBeenCalledWith(join(targetDir, '.cursor', 'cursor-rules-config.json'), 'utf-8');
    });

    it('должен возвращать null если файл не существует', async () => {
        mockPathExists.mockResolvedValue(false);

        const targetDir = getTestPath('target');

        const result = await readConfigFile(targetDir);

        expect(result).toBeNull();
        expect(mockPathExists).toHaveBeenCalled();
        expect(mockReadFile).not.toHaveBeenCalled();
    });

    it('должен возвращать null при ошибке парсинга JSON', async () => {
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue('invalid json');

        const targetDir = getTestPath('target');

        const result = await readConfigFile(targetDir);

        expect(result).toBeNull();
    });

    it('должен возвращать null при ошибке валидации схемы', async () => {
        const invalidConfig = {
            version: '1.0.0',
        };

        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(invalidConfig));

        const targetDir = getTestPath('target');

        const result = await readConfigFile(targetDir);

        expect(result).toBeNull();
    });

    it('должен выбрасывать ошибку если targetDir пустой', async () => {
        await expect(readConfigFile('')).rejects.toThrow('targetDir is required');
    });
});
