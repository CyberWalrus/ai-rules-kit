import { beforeEach, describe, expect, it, vi } from 'vitest';

import { scanDirectory } from '../scan-directory';

const { mockReaddir, mockStat } = vi.hoisted(() => ({
    mockReaddir: vi.fn(),
    mockStat: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    readdir: mockReaddir,
    stat: mockStat,
}));

vi.mock('../get-file-hash', () => ({
    getFileHash: vi.fn().mockImplementation((path: string) => Promise.resolve(`hash-of-${path}`)),
}));

describe('scanDirectory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен сканировать директорию с файлами', async () => {
        mockReaddir.mockResolvedValue([
            { isDirectory: () => false, isFile: () => true, name: 'file1.txt' },
            { isDirectory: () => false, isFile: () => true, name: 'file2.txt' },
        ]);

        const result = await scanDirectory('/test');

        expect(result.size).toBe(2);
        expect(result.has('file1.txt')).toBe(true);
        expect(result.has('file2.txt')).toBe(true);
    });

    it('должен рекурсивно сканировать поддиректории', async () => {
        mockReaddir
            .mockResolvedValueOnce([
                { isDirectory: () => true, isFile: () => false, name: 'subdir' },
                { isDirectory: () => false, isFile: () => true, name: 'file1.txt' },
            ])
            .mockResolvedValueOnce([{ isDirectory: () => false, isFile: () => true, name: 'file2.txt' }]);

        const result = await scanDirectory('/test');

        expect(result.size).toBe(2);
        expect(result.has('file1.txt')).toBe(true);
        expect(result.has('subdir/file2.txt')).toBe(true);
    });

    it('должен возвращать пустую карту для пустой директории', async () => {
        mockReaddir.mockResolvedValue([]);

        const result = await scanDirectory('/test');

        expect(result.size).toBe(0);
    });

    it('должен возвращать пустую карту если директория не существует', async () => {
        const error = new Error('ENOENT') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        mockReaddir.mockRejectedValue(error);

        const result = await scanDirectory('/test/missing');

        expect(result.size).toBe(0);
    });

    it('должен выбрасывать ошибку если dirPath пустой', async () => {
        await expect(scanDirectory('')).rejects.toThrow('dirPath is required');
    });

    it('должен выбрасывать ошибку если dirPath null', async () => {
        await expect(scanDirectory(null as unknown as string)).rejects.toThrow('dirPath is required');
    });

    it('должен выбрасывать ошибку если dirPath undefined', async () => {
        await expect(scanDirectory(undefined as unknown as string)).rejects.toThrow('dirPath is required');
    });

    it('должен выбрасывать ошибку при других ошибках чтения директории', async () => {
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        mockReaddir.mockRejectedValue(error);

        await expect(scanDirectory('/test/restricted')).rejects.toThrow('Failed to scan directory');
    });

    it('должен игнорировать записи которые не являются ни файлами ни директориями', async () => {
        mockReaddir.mockResolvedValue([
            { isDirectory: () => false, isFile: () => true, name: 'file.txt' },
            { isDirectory: () => false, isFile: () => false, name: 'symlink' },
        ]);

        const result = await scanDirectory('/test');

        expect(result.size).toBe(1);
        expect(result.has('file.txt')).toBe(true);
        expect(result.has('symlink')).toBe(false);
    });

    it('должен правильно обрабатывать вложенные директории', async () => {
        mockReaddir
            .mockResolvedValueOnce([{ isDirectory: () => true, isFile: () => false, name: 'level1' }])
            .mockResolvedValueOnce([{ isDirectory: () => true, isFile: () => false, name: 'level2' }])
            .mockResolvedValueOnce([{ isDirectory: () => false, isFile: () => true, name: 'file.txt' }]);

        const result = await scanDirectory('/test');

        expect(result.size).toBe(1);
        expect(result.has('level1/level2/file.txt')).toBe(true);
    });
});
