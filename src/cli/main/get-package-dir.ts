import { dirname, join } from 'node:path';

/** Определяет директорию пакета на основе пути к текущему файлу */
export function getPackageDir(currentFilePath: string): string {
    if (!currentFilePath) {
        throw new Error('currentFilePath is required');
    }

    const normalizedPath = currentFilePath.replace(/\\/g, '/');

    return normalizedPath.includes('/dist/')
        ? join(dirname(currentFilePath), '..')
        : join(dirname(currentFilePath), '..', '..', '..');
}
