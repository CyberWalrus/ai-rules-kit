import { join } from 'node:path';

import type { RulesConfig } from '../../../model';
import { readConfigFile } from '../read-config-file';

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
        const config: RulesConfig = {
            configVersion: '1.0.0',
            installedAt: '2025-11-01T12:00:00.000Z',
            ruleSets: [
                {
                    id: 'base',
                    update: true,
                },
            ],
            settings: {
                language: 'ru',
            },
            source: 'cursor-rules',
            updatedAt: '2025-11-01T12:00:00.000Z',
            version: '1.0.0',
        };

        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(config));

        const result = await readConfigFile('/target');

        expect(result).toEqual(config);
        expect(mockPathExists).toHaveBeenCalled();
        expect(mockReadFile).toHaveBeenCalledWith(join('/target', '.cursor', 'cursor-rules-config.json'), 'utf-8');
    });

    it('должен возвращать null если файл не существует', async () => {
        mockPathExists.mockResolvedValue(false);

        const result = await readConfigFile('/target');

        expect(result).toBeNull();
        expect(mockPathExists).toHaveBeenCalled();
        expect(mockReadFile).not.toHaveBeenCalled();
    });

    it('должен возвращать null при ошибке парсинга JSON', async () => {
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue('invalid json');

        const result = await readConfigFile('/target');

        expect(result).toBeNull();
    });

    it('должен возвращать null при ошибке валидации схемы', async () => {
        const invalidConfig = {
            version: '1.0.0',
        };

        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(invalidConfig));

        const result = await readConfigFile('/target');

        expect(result).toBeNull();
    });

    it('должен выбрасывать ошибку если targetDir пустой', async () => {
        await expect(readConfigFile('')).rejects.toThrow('targetDir is required');
    });
});
