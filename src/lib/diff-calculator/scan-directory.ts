import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

import type { FileHashMap } from '../../model/types/main';
import { isEmptyString } from '../helpers';
import { getFileHash } from './get-file-hash';

/** Сканирует директорию рекурсивно и возвращает карту файлов с их хешами */
export async function scanDirectory(dirPath: string, baseDir: string = dirPath): Promise<FileHashMap> {
    if (isEmptyString(dirPath)) {
        throw new Error('dirPath is required');
    }
    if (isEmptyString(baseDir)) {
        throw new Error('baseDir is required');
    }

    const fileHashMap: FileHashMap = new Map();

    try {
        const entries = await readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dirPath, entry.name);

            if (entry.isDirectory()) {
                const subDirMap = await scanDirectory(fullPath, baseDir);
                subDirMap.forEach((hash, path) => {
                    fileHashMap.set(path, hash);
                });
            } else if (entry.isFile()) {
                const hash = await getFileHash(fullPath);
                const relativePath = relative(baseDir, fullPath);
                fileHashMap.set(relativePath, hash);
            }
        }

        return fileHashMap;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return new Map();
        }
        throw new Error(`Failed to scan directory ${dirPath}: ${String(error)}`);
    }
}
