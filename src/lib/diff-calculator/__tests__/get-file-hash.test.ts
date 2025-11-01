import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getFileHash } from '../get-file-hash';

const { mockReadFile } = vi.hoisted(() => ({
    mockReadFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
    readFile: mockReadFile,
}));

describe('getFileHash', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен вычислять SHA-256 хеш содержимого файла', async () => {
        mockReadFile.mockResolvedValue(Buffer.from('test content'));

        const hash = await getFileHash('/test/file.txt');

        expect(mockReadFile).toHaveBeenCalledWith('/test/file.txt');
        expect(hash).toBe('6ae8a75555209fd6c44157c0aed8016e763ff435a19cf186f76863140143ff72');
    });

    it('должен возвращать разные хеши для разного содержимого', async () => {
        mockReadFile.mockResolvedValueOnce(Buffer.from('content 1'));
        const hash1 = await getFileHash('/test/file1.txt');

        mockReadFile.mockResolvedValueOnce(Buffer.from('content 2'));
        const hash2 = await getFileHash('/test/file2.txt');

        expect(hash1).not.toBe(hash2);
    });

    it('должен возвращать одинаковые хеши для одинакового содержимого', async () => {
        const content = Buffer.from('same content');

        mockReadFile.mockResolvedValueOnce(content);
        const hash1 = await getFileHash('/test/file1.txt');

        mockReadFile.mockResolvedValueOnce(content);
        const hash2 = await getFileHash('/test/file2.txt');

        expect(hash1).toBe(hash2);
    });

    it('должен выбрасывать ошибку если filePath пустой', async () => {
        await expect(getFileHash('')).rejects.toThrow('filePath is required');
    });

    it('должен выбрасывать ошибку если filePath null', async () => {
        await expect(getFileHash(null as unknown as string)).rejects.toThrow('filePath is required');
    });

    it('должен выбрасывать ошибку если filePath undefined', async () => {
        await expect(getFileHash(undefined as unknown as string)).rejects.toThrow('filePath is required');
    });

    it('должен выбрасывать ошибку если чтение файла не удалось', async () => {
        mockReadFile.mockRejectedValue(new Error('ENOENT: no such file'));

        await expect(getFileHash('/test/missing.txt')).rejects.toThrow('Failed to calculate hash');
    });

    it('должен обрабатывать пустые файлы', async () => {
        mockReadFile.mockResolvedValue(Buffer.from(''));

        const hash = await getFileHash('/test/empty.txt');

        expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('должен обрабатывать бинарные файлы', async () => {
        mockReadFile.mockResolvedValue(Buffer.from([0x00, 0x01, 0x02, 0x03]));

        const hash = await getFileHash('/test/binary.bin');

        expect(hash).toBe('054edec1d0211f624fed0cbca9d4f9400b0e491c43742af2c5b0abebf0c990d8');
    });
});
