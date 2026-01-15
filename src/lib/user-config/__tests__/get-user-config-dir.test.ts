import { join } from 'node:path';

import { getUserConfigDir } from '../get-user-config-dir';

const { mockPlatform } = vi.hoisted(() => ({
    mockPlatform: vi.fn(),
}));

vi.mock('node:os', () => ({
    platform: mockPlatform,
}));

describe('getUserConfigDir', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('должен возвращать путь для Windows', () => {
        mockPlatform.mockReturnValue('win32');
        process.env.APPDATA = 'C:\\Users\\Test\\AppData\\Roaming';

        const result = getUserConfigDir();

        expect(result).toBe(join('C:\\Users\\Test\\AppData\\Roaming', 'ai-rules-kit'));
    });

    it('должен выбрасывать ошибку если APPDATA не установлен на Windows', () => {
        mockPlatform.mockReturnValue('win32');
        delete process.env.APPDATA;

        expect(() => getUserConfigDir()).toThrow('APPDATA environment variable is not set');
    });

    it('должен возвращать путь для macOS', () => {
        mockPlatform.mockReturnValue('darwin');
        process.env.HOME = '/Users/test';

        const result = getUserConfigDir();

        expect(result).toBe(join('/Users/test', 'Library', 'Preferences', 'ai-rules-kit'));
    });

    it('должен выбрасывать ошибку если HOME не установлен на macOS', () => {
        mockPlatform.mockReturnValue('darwin');
        delete process.env.HOME;

        expect(() => getUserConfigDir()).toThrow('HOME environment variable is not set');
    });

    it('должен возвращать путь для Linux с XDG_CONFIG_HOME', () => {
        mockPlatform.mockReturnValue('linux');
        process.env.XDG_CONFIG_HOME = '/home/test/.config';
        process.env.HOME = '/home/test';

        const result = getUserConfigDir();

        expect(result).toBe(join('/home/test/.config', 'ai-rules-kit'));
    });

    it('должен возвращать путь для Linux без XDG_CONFIG_HOME', () => {
        mockPlatform.mockReturnValue('linux');
        delete process.env.XDG_CONFIG_HOME;
        process.env.HOME = '/home/test';

        const result = getUserConfigDir();

        expect(result).toBe(join('/home/test', '.config', 'ai-rules-kit'));
    });

    it('должен выбрасывать ошибку если HOME не установлен на Linux', () => {
        mockPlatform.mockReturnValue('linux');
        delete process.env.HOME;
        delete process.env.XDG_CONFIG_HOME;

        expect(() => getUserConfigDir()).toThrow('HOME environment variable is not set');
    });
});
