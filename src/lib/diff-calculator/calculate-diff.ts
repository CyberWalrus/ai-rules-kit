import { join } from 'node:path';

import type { VersionDiff } from '../../model';
import { RULES_DIRS } from '../../model';
import { isEmptyString } from '../helpers';
import { scanDirectory } from './scan-directory';

/** Вычисляет diff между версиями правил */
export async function calculateDiff(packageDir: string, targetDir: string): Promise<VersionDiff> {
    if (isEmptyString(packageDir)) {
        throw new Error('packageDir is required');
    }
    if (isEmptyString(targetDir)) {
        throw new Error('targetDir is required');
    }

    const toAdd: string[] = [];
    const toDelete: string[] = [];
    const toUpdate: string[] = [];

    // Сканируем каждую директорию правил
    await Promise.all(
        RULES_DIRS.map(async (ruleDir) => {
            const sourcePath = join(packageDir, ruleDir);
            const targetPath = join(targetDir, ruleDir);

            try {
                const sourceMap = await scanDirectory(sourcePath);
                const targetMap = await scanDirectory(targetPath);

                // Находим новые и измененные файлы
                sourceMap.forEach((sourceHash, relativePath) => {
                    const fullPath = join(ruleDir, relativePath);
                    const targetHash = targetMap.get(relativePath);

                    if (targetHash === null || targetHash === undefined) {
                        // Файл существует в source, но не в target - добавить
                        toAdd.push(fullPath);
                    } else if (sourceHash !== targetHash) {
                        // Файл изменился - обновить
                        toUpdate.push(fullPath);
                    }
                });

                // Находим удаленные файлы
                targetMap.forEach((_, relativePath) => {
                    if (!sourceMap.has(relativePath)) {
                        // Файл существует в target, но не в source - удалить
                        const fullPath = join(ruleDir, relativePath);
                        toDelete.push(fullPath);
                    }
                });
            } catch (error) {
                // Если директория не существует, логируем и продолжаем
                console.error(`Failed to scan directory ${ruleDir}:`, error);
            }
        }),
    );

    return {
        toAdd,
        toDelete,
        toUpdate,
    };
}
