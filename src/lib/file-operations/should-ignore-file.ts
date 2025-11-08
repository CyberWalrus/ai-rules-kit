import { isMatch } from 'micromatch';
import { normalize } from 'node:path';

/** Проверяет, должен ли файл быть проигнорирован */
export function shouldIgnoreFile(filePath: string, ignoreList: string[]): boolean {
    if (ignoreList.length === 0) {
        return false;
    }

    const normalizedPath = normalize(filePath.replace(/\\/g, '/'));

    return ignoreList.some((pattern) => {
        const normalizedPattern = normalize(pattern.replace(/\\/g, '/'));

        return isMatch(normalizedPath, normalizedPattern);
    });
}
