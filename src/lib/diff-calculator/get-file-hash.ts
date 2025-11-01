import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

/** Вычисляет SHA-256 хеш содержимого файла */
export async function getFileHash(filePath: string): Promise<string> {
    if (!filePath) {
        throw new Error('filePath is required');
    }

    try {
        const content = await readFile(filePath);
        const hash = createHash('sha256');
        hash.update(content);

        return hash.digest('hex');
    } catch (error) {
        throw new Error(`Failed to calculate hash for ${filePath}: ${String(error)}`);
    }
}
