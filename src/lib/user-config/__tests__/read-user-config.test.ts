import { join } from 'node:path';

import type { UserConfig } from '../../../model/types/main';
import { readUserConfig } from '../read-user-config';

const { mockReadFile, mockPathExists, mockGetUserConfigDir } = vi.hoisted(() => ({
    mockGetUserConfigDir: vi.fn(),
    mockPathExists: vi.fn(),
    mockReadFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    readFile: mockReadFile,
}));

vi.mock('../../file-operations/path-exists', () => ({
    pathExists: mockPathExists,
}));

vi.mock('../get-user-config-dir', () => ({
    getUserConfigDir: mockGetUserConfigDir,
}));

describe('readUserConfig', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetUserConfigDir.mockReturnValue('/test/config');
    });

    it('должен читать и парсить файл конфигурации', async () => {
        const config: UserConfig = {
            language: 'ru',
        };

        mockGetUserConfigDir.mockReturnValue('/test/config');
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(config));

        const result = await readUserConfig();

        expect(result).toEqual(config);
        expect(mockGetUserConfigDir).toHaveBeenCalled();
        expect(mockPathExists).toHaveBeenCalledWith(join('/test/config', 'config.json'));
        expect(mockReadFile).toHaveBeenCalledWith(join('/test/config', 'config.json'), 'utf8');
    });

    it('должен возвращать null если файл не существует', async () => {
        mockPathExists.mockResolvedValue(false);

        const result = await readUserConfig();

        expect(result).toBeNull();
        expect(mockReadFile).not.toHaveBeenCalled();
    });

    it('должен возвращать null при ошибке парсинга JSON', async () => {
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue('invalid json');

        const result = await readUserConfig();

        expect(result).toBeNull();
    });

    it('должен возвращать null при ошибке валидации схемы', async () => {
        const invalidConfig = {
            language: 'invalid',
        };

        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockResolvedValue(JSON.stringify(invalidConfig));

        const result = await readUserConfig();

        expect(result).toBeNull();
    });

    it('должен возвращать null при ошибке чтения файла', async () => {
        mockPathExists.mockResolvedValue(true);
        mockReadFile.mockRejectedValue(new Error('File read error'));

        const result = await readUserConfig();

        expect(result).toBeNull();
    });
});
