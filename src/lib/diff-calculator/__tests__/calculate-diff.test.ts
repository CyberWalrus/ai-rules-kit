import { beforeEach, describe, expect, it, vi } from 'vitest';

import { calculateDiff } from '../calculate-diff';
import { scanDirectory } from '../scan-directory';

vi.mock('../scan-directory');

const mockScanDirectory = vi.mocked(scanDirectory);

describe('calculateDiff', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен определять новые файлы (toAdd)', async () => {
        const sourceMap = new Map([
            ['file1.txt', 'hash1'],
            ['file2.txt', 'hash2'],
        ]);
        const targetMap = new Map([['file1.txt', 'hash1']]);

        mockScanDirectory
            .mockResolvedValueOnce(sourceMap)
            .mockResolvedValueOnce(targetMap)
            .mockResolvedValue(new Map());

        const result = await calculateDiff('/package', '/target');

        expect(result.toAdd).toContain('.cursor/rules/file2.txt');
    });

    it('должен определять измененные файлы (toUpdate)', async () => {
        const sourceMap = new Map([['file1.txt', 'hash1-new']]);
        const targetMap = new Map([['file1.txt', 'hash1-old']]);

        mockScanDirectory.mockImplementation((path: string) => {
            const normalizedPath = path.replace(/\\/g, '/');
            if (normalizedPath.includes('.cursor/rules') && normalizedPath.includes('/package')) {
                return Promise.resolve(sourceMap);
            }
            if (normalizedPath.includes('.cursor/rules') && normalizedPath.includes('/target')) {
                return Promise.resolve(targetMap);
            }

            return Promise.resolve(new Map());
        });

        const result = await calculateDiff('/package', '/target');

        expect(result.toUpdate).toContain('.cursor/rules/file1.txt');
    });

    it('должен определять удаленные файлы (toDelete)', async () => {
        const sourceMap = new Map([['file1.txt', 'hash1']]);
        const targetMap = new Map([
            ['file1.txt', 'hash1'],
            ['file2.txt', 'hash2'],
        ]);

        mockScanDirectory.mockImplementation((path: string) => {
            const normalizedPath = path.replace(/\\/g, '/');
            if (normalizedPath.includes('.cursor/rules') && normalizedPath.includes('/package')) {
                return Promise.resolve(sourceMap);
            }
            if (normalizedPath.includes('.cursor/rules') && normalizedPath.includes('/target')) {
                return Promise.resolve(targetMap);
            }

            return Promise.resolve(new Map());
        });

        const result = await calculateDiff('/package', '/target');

        expect(result.toDelete).toContain('.cursor/rules/file2.txt');
    });

    it('должен возвращать пустые массивы если файлы идентичны', async () => {
        const sameMap = new Map([
            ['file1.txt', 'hash1'],
            ['file2.txt', 'hash2'],
        ]);

        mockScanDirectory.mockResolvedValue(sameMap);

        const result = await calculateDiff('/package', '/target');

        expect(result.toAdd).toEqual([]);
        expect(result.toUpdate).toEqual([]);
        expect(result.toDelete).toEqual([]);
    });

    it('должен обрабатывать пустые директории', async () => {
        mockScanDirectory.mockResolvedValue(new Map());

        const result = await calculateDiff('/package', '/target');

        expect(result.toAdd).toEqual([]);
        expect(result.toUpdate).toEqual([]);
        expect(result.toDelete).toEqual([]);
    });

    it('должен выбрасывать ошибку если packageDir пустой', async () => {
        await expect(calculateDiff('', '/target')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если packageDir null', async () => {
        await expect(calculateDiff(null as unknown as string, '/target')).rejects.toThrow('packageDir is required');
    });

    it('должен выбрасывать ошибку если packageDir undefined', async () => {
        await expect(calculateDiff(undefined as unknown as string, '/target')).rejects.toThrow(
            'packageDir is required',
        );
    });

    it('должен выбрасывать ошибку если targetDir пустой', async () => {
        await expect(calculateDiff('/package', '')).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если targetDir null', async () => {
        await expect(calculateDiff('/package', null as unknown as string)).rejects.toThrow('targetDir is required');
    });

    it('должен выбрасывать ошибку если targetDir undefined', async () => {
        await expect(calculateDiff('/package', undefined as unknown as string)).rejects.toThrow(
            'targetDir is required',
        );
    });

    it('должен обрабатывать несколько директорий правил', async () => {
        const sourceMap = new Map<string, string>([['file.txt', 'hash1']]);
        const emptyMap = new Map<string, string>();

        mockScanDirectory
            .mockResolvedValueOnce(sourceMap)
            .mockResolvedValueOnce(emptyMap)
            .mockResolvedValue(new Map<string, string>());

        const result = await calculateDiff('/package', '/target');

        expect(result.toAdd.length).toBeGreaterThan(0);
    });

    it('должен продолжать работу если одна из директорий не существует', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockScanDirectory.mockRejectedValueOnce(new Error('ENOENT')).mockResolvedValue(new Map<string, string>());

        const result = await calculateDiff('/package', '/target');

        expect(result).toBeDefined();
        expect(result.toAdd).toEqual([]);
        consoleErrorSpy.mockRestore();
    });
});
