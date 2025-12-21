import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getCursorConfigDir } from '../get-cursor-config-dir';

const { mockPlatform, mockPathExists } = vi.hoisted(() => ({
    mockPathExists: vi.fn(),
    mockPlatform: vi.fn(),
}));

vi.mock('node:os', () => ({
    platform: mockPlatform,
}));

vi.mock('../../file-operations/path-exists', () => ({
    pathExists: mockPathExists,
}));

describe('getCursorConfigDir', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        mockPathExists.mockResolvedValue(false);
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('должен возвращать стандартный путь для Windows если директория существует', async () => {
        mockPlatform.mockReturnValue('win32');
        process.env.APPDATA = 'C:\\Users\\Test\\AppData\\Roaming';
        mockPathExists.mockImplementation((path: string) =>
            Promise.resolve(path.includes('Cursor') && !path.includes('.cursor')),
        );

        const result = await getCursorConfigDir();

        expect(result).toBe(join('C:\\Users\\Test\\AppData\\Roaming', 'Cursor'));
    });

    it('должен возвращать альтернативный путь для Windows если стандартный не существует', async () => {
        mockPlatform.mockReturnValue('win32');
        process.env.APPDATA = 'C:\\Users\\Test\\AppData\\Roaming';
        process.env.USERPROFILE = 'C:\\Users\\Test';
        mockPathExists.mockImplementation((path: string) => Promise.resolve(path.includes('.cursor')));

        const result = await getCursorConfigDir();

        expect(result).toBe(join('C:\\Users\\Test', '.cursor'));
    });

    it('должен возвращать стандартный путь для Windows если ни один не существует', async () => {
        mockPlatform.mockReturnValue('win32');
        process.env.APPDATA = 'C:\\Users\\Test\\AppData\\Roaming';
        mockPathExists.mockResolvedValue(false);

        const result = await getCursorConfigDir();

        expect(result).toBe(join('C:\\Users\\Test\\AppData\\Roaming', 'Cursor'));
    });

    it('должен выбрасывать ошибку если APPDATA не установлен на Windows', async () => {
        mockPlatform.mockReturnValue('win32');
        delete process.env.APPDATA;

        await expect(getCursorConfigDir()).rejects.toThrow('APPDATA environment variable is not set');
    });

    it('должен возвращать стандартный путь для macOS если директория существует', async () => {
        mockPlatform.mockReturnValue('darwin');
        process.env.HOME = '/Users/test';
        mockPathExists.mockImplementation((path: string) =>
            Promise.resolve(path.includes('Application Support') && path.includes('Cursor')),
        );

        const result = await getCursorConfigDir();

        expect(result).toBe(join('/Users/test', 'Library', 'Application Support', 'Cursor'));
    });

    it('должен возвращать альтернативный путь для macOS если стандартный не существует', async () => {
        mockPlatform.mockReturnValue('darwin');
        process.env.HOME = '/Users/test';
        mockPathExists.mockImplementation((path: string) =>
            Promise.resolve(path.includes('.cursor') && !path.includes('Application Support')),
        );

        const result = await getCursorConfigDir();

        expect(result).toBe(join('/Users/test', '.cursor'));
    });

    it('должен возвращать стандартный путь для macOS если ни один не существует', async () => {
        mockPlatform.mockReturnValue('darwin');
        process.env.HOME = '/Users/test';
        mockPathExists.mockResolvedValue(false);

        const result = await getCursorConfigDir();

        expect(result).toBe(join('/Users/test', 'Library', 'Application Support', 'Cursor'));
    });

    it('должен выбрасывать ошибку если HOME не установлен на macOS', async () => {
        mockPlatform.mockReturnValue('darwin');
        delete process.env.HOME;

        await expect(getCursorConfigDir()).rejects.toThrow('HOME environment variable is not set');
    });

    it('должен возвращать путь для Linux с XDG_CONFIG_HOME если директория существует', async () => {
        mockPlatform.mockReturnValue('linux');
        process.env.XDG_CONFIG_HOME = '/home/test/.config';
        process.env.HOME = '/home/test';
        mockPathExists.mockImplementation((path: string) =>
            Promise.resolve(path.includes('.config') && path.includes('cursor')),
        );

        const result = await getCursorConfigDir();

        expect(result).toBe(join('/home/test/.config', 'cursor'));
    });

    it('должен возвращать путь для Linux без XDG_CONFIG_HOME если директория существует', async () => {
        mockPlatform.mockReturnValue('linux');
        delete process.env.XDG_CONFIG_HOME;
        process.env.HOME = '/home/test';
        mockPathExists.mockImplementation((path: string) => Promise.resolve(path.includes('.cursor')));

        const result = await getCursorConfigDir();

        expect(result).toBe(join('/home/test', '.cursor'));
    });

    it('должен возвращать стандартный путь для Linux если ни один не существует', async () => {
        mockPlatform.mockReturnValue('linux');
        process.env.HOME = '/home/test';
        mockPathExists.mockResolvedValue(false);

        const result = await getCursorConfigDir();

        expect(result).toBe(join('/home/test', '.cursor'));
    });

    it('должен выбрасывать ошибку если HOME не установлен на Linux', async () => {
        mockPlatform.mockReturnValue('linux');
        delete process.env.HOME;
        delete process.env.XDG_CONFIG_HOME;

        await expect(getCursorConfigDir()).rejects.toThrow('HOME environment variable is not set');
    });
});
