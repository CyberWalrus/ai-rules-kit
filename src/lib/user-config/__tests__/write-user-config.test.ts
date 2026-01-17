import { join } from 'node:path';

import type { UserConfig } from '../../../model';
import { writeUserConfig } from '../write-user-config';

const { mockMkdir, mockWriteFile, mockGetUserConfigDir } = vi.hoisted(() => ({
    mockGetUserConfigDir: vi.fn(),
    mockMkdir: vi.fn(),
    mockWriteFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
}));

vi.mock('../get-user-config-dir', () => ({
    getUserConfigDir: mockGetUserConfigDir,
}));

describe('writeUserConfig', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetUserConfigDir.mockReturnValue('/test/config');
    });

    it('должен создавать директорию и записывать файл конфигурации', async () => {
        const config: UserConfig = {
            language: 'ru',
        };

        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockResolvedValue(undefined);

        await writeUserConfig(config);

        expect(mockMkdir).toHaveBeenCalledWith('/test/config', { recursive: true });
        expect(mockWriteFile).toHaveBeenCalledWith(
            join('/test/config', 'config.json'),
            JSON.stringify(config, null, 2),
            'utf8',
        );
    });

    it('должен выбрасывать ошибку если config равен null', async () => {
        await expect(writeUserConfig(null as unknown as UserConfig)).rejects.toThrow('config is required');
    });

    it('должен выбрасывать ошибку если config равен undefined', async () => {
        await expect(writeUserConfig(undefined as unknown as UserConfig)).rejects.toThrow('config is required');
    });

    it('должен выбрасывать ошибку при ошибке создания директории', async () => {
        const config: UserConfig = {
            language: 'en',
        };

        mockMkdir.mockRejectedValue(new Error('Permission denied'));

        await expect(writeUserConfig(config)).rejects.toThrow('Failed to write user config file');
    });

    it('должен выбрасывать ошибку при ошибке записи файла', async () => {
        const config: UserConfig = {
            language: 'en',
        };

        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockRejectedValue(new Error('Disk full'));

        await expect(writeUserConfig(config)).rejects.toThrow('Failed to write user config file');
    });
});
